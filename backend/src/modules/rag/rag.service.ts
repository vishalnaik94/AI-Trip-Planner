import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pinecone } from '@pinecone-database/pinecone';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class RagService {
  private readonly logger = new Logger(RagService.name);
  private pinecone: Pinecone | null = null;
  private genAI: GoogleGenerativeAI;
  private indexName: string;

  constructor(private readonly configService: ConfigService) {
    const pineconeKey = this.configService.get<string>('PINECONE_API_KEY', '');
    this.indexName = this.configService.get<string>(
      'PINECONE_INDEX',
      'trip-planner-index',
    );
    const geminiKey = this.configService.get<string>('GEMINI_API_KEY', '');
    this.genAI = new GoogleGenerativeAI(geminiKey);

    if (pineconeKey && pineconeKey !== 'your_pinecone_key') {
      this.pinecone = new Pinecone({ apiKey: pineconeKey });
      this.logger.log('Pinecone initialized');
    } else {
      this.logger.warn(
        'Pinecone API key not set — RAG pipeline running in fallback mode',
      );
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const model = this.genAI.getGenerativeModel({
      model: 'gemini-embedding-001',
    });
    const result = await model.embedContent(text);
    return result.embedding.values;
  }

  async ingestDocument(
    id: string,
    text: string,
    metadata: Record<string, string>,
  ): Promise<void> {
    if (!this.pinecone) {
      this.logger.warn('Pinecone not configured — skipping ingestion');
      return;
    }

    const embedding = await this.generateEmbedding(text);
    const index = this.pinecone.Index(this.indexName);

    await index.upsert([
      {
        id,
        values: embedding,
        metadata: { ...metadata, text },
      },
    ]);
    this.logger.log(`Ingested document: ${id}`);
  }

  async retrieveContext(query: string, topK: number = 5): Promise<string> {
    if (!this.pinecone) {
      this.logger.warn(
        'Pinecone not configured — returning empty context',
      );
      return '';
    }

    try {
      const queryEmbedding = await this.generateEmbedding(query);
      const index = this.pinecone.Index(this.indexName);

      const results = await index.query({
        vector: queryEmbedding,
        topK,
        includeMetadata: true,
      });

      const contextChunks = results.matches
        .filter((match) => match.metadata?.['text'])
        .map(
          (match) =>
            `[Score: ${match.score?.toFixed(3)}] ${match.metadata?.['text']}`,
        );

      return contextChunks.join('\n\n');
    } catch (error) {
      console.log(error);
      this.logger.error('RAG retrieval failed', error);
      return '';
    }
  }

  async ingestTravelData(data: {
    destination: string;
    content: string;
    category: string;
  }): Promise<void> {
    const id = `${data.destination}-${data.category}-${Date.now()}`;
    await this.ingestDocument(id, data.content, {
      destination: data.destination,
      category: data.category,
    });
  }
}
