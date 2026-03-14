import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface TripPreferences {
  destination: string;
  startDate: string;
  endDate: string;
  duration: number;
  budget: string;
  travelerType: string;
  interests: string[];
  specialRequirements?: string;
}

export interface ItineraryDay {
  day: number;
  date: string;
  activities: Array<{
    time: string;
    activity: string;
    location: string;
    estimatedCost: number;
    duration: string;
    notes?: string;
  }>;
  hotel: {
    name: string;
    estimatedCost: number;
    rating?: number;
  };
  meals: Array<{
    type: string;
    restaurant: string;
    cuisine: string;
    estimatedCost: number;
  }>;
}

export interface GeneratedItinerary {
  days: ItineraryDay[];
  totalEstimatedCost: number;
  tips: string[];
  warnings: string[];
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private genAI: GoogleGenerativeAI;
  private modelName = 'gemini-2.5-flash';

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY', '');
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  buildPrompt(preferences: TripPreferences, ragContext: string): string {
    return `You are an expert travel planner. Using the context below, create a detailed ${preferences.duration}-day itinerary for ${preferences.destination}.

Traveler Profile:
- Budget: ${preferences.budget}
- Type: ${preferences.travelerType}
- Interests: ${preferences.interests.join(', ')}
- Travel Dates: ${preferences.startDate} to ${preferences.endDate}
${preferences.specialRequirements ? `- Special Requirements: ${preferences.specialRequirements}` : ''}

Context from knowledge base:
${ragContext || 'No additional context available. Use your general knowledge.'}

Return a JSON object with this EXACT structure (no markdown, just raw JSON):
{
  "days": [
    {
      "day": 1,
      "date": "${preferences.startDate}",
      "activities": [
        {
          "time": "09:00",
          "activity": "Activity name",
          "location": "Location name",
          "estimatedCost": 0,
          "duration": "2 hours",
          "notes": "Optional notes"
        }
      ],
      "hotel": {
        "name": "Hotel name",
        "estimatedCost": 100,
        "rating": 4.5
      },
      "meals": [
        {
          "type": "breakfast",
          "restaurant": "Restaurant name",
          "cuisine": "Cuisine type",
          "estimatedCost": 15
        }
      ]
    }
  ],
  "totalEstimatedCost": 0,
  "tips": ["tip1", "tip2"],
  "warnings": ["warning1"]
}

Important:
- Include 3-5 activities per day
- Include breakfast, lunch, and dinner for each day
- All costs should be in USD
- Be specific with restaurant and hotel names (real places when possible)
- Include practical tips and any travel warnings`;
  }

  async generateItinerary(
    preferences: TripPreferences,
    ragContext: string = '',
  ): Promise<GeneratedItinerary> {
    const prompt = this.buildPrompt(preferences, ragContext);

    try {
      const model = this.genAI.getGenerativeModel({ model: this.modelName });
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      // Parse the JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Failed to extract JSON from Gemini response');
      }

      const itinerary: GeneratedItinerary = JSON.parse(jsonMatch[0]);
      this.logger.log(
        `Generated itinerary for ${preferences.destination}: ${itinerary.days.length} days`,
      );

      return itinerary;
    } catch (error) {
      this.logger.error('Failed to generate itinerary', error);
      throw error;
    }
  }
}
