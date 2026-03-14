import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Trip, TripStatus } from './entities/trip.entity.js';
import { Itinerary } from './entities/itinerary.entity.js';
import { CreateTripDto } from './dto/create-trip.dto.js';
import { AiService } from '../ai/ai.service.js';
import { RagService } from '../rag/rag.service.js';

@Injectable()
export class TripsService {
  private readonly logger = new Logger(TripsService.name);

  constructor(
    @InjectRepository(Trip)
    private readonly tripRepository: Repository<Trip>,
    @InjectRepository(Itinerary)
    private readonly itineraryRepository: Repository<Itinerary>,
    private readonly aiService: AiService,
    private readonly ragService: RagService,
  ) {}

  async createTrip(userId: string, dto: CreateTripDto): Promise<Trip> {
    const trip = this.tripRepository.create({
      userId,
      ...dto,
      status: TripStatus.DRAFT,
    });
    return this.tripRepository.save(trip);
  }

  async generateItinerary(tripId: string, userId: string): Promise<Itinerary> {
    const trip = await this.tripRepository.findOne({
      where: { id: tripId, userId },
    });
    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    // Update status to generating
    trip.status = TripStatus.GENERATING;
    await this.tripRepository.save(trip);

    try {
      // Calculate duration
      const start = new Date(trip.startDate);
      const end = new Date(trip.endDate);
      const duration = Math.ceil(
        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
      );

      // Retrieve RAG context
      const ragQuery = `Travel guide for ${trip.destination}: ${trip.interests.join(', ')} activities for ${trip.travelerType} traveler with ${trip.budget} budget`;
      const ragContext = await this.ragService.retrieveContext(ragQuery);

      // Generate itinerary via Gemini
      const generatedItinerary = await this.aiService.generateItinerary(
        {
          destination: trip.destination,
          startDate: trip.startDate,
          endDate: trip.endDate,
          duration,
          budget: trip.budget,
          travelerType: trip.travelerType,
          interests: trip.interests,
          specialRequirements: trip.specialRequirements,
        },
        ragContext,
      );

      // Save itinerary
      const itinerary = this.itineraryRepository.create({
        tripId: trip.id,
        rawJson: generatedItinerary,
        totalCost: generatedItinerary.totalEstimatedCost,
        geminiModelUsed: 'gemini-2.5-flash',
      });
      await this.itineraryRepository.save(itinerary);

      // Update trip status
      trip.status = TripStatus.COMPLETED;
      await this.tripRepository.save(trip);

      this.logger.log(`Itinerary generated for trip ${tripId}`);
      return itinerary;
    } catch (error) {
      trip.status = TripStatus.FAILED;
      await this.tripRepository.save(trip);
      this.logger.error(`Failed to generate itinerary for trip ${tripId}`, error);
      throw error;
    }
  }

  async getUserTrips(userId: string): Promise<Trip[]> {
    return this.tripRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      relations: ['itineraries'],
    });
  }

  async getTripById(tripId: string, userId: string): Promise<Trip> {
    const trip = await this.tripRepository.findOne({
      where: { id: tripId, userId },
      relations: ['itineraries'],
    });
    if (!trip) {
      throw new NotFoundException('Trip not found');
    }
    return trip;
  }

  async getItinerary(tripId: string, userId: string): Promise<Itinerary> {
    const trip = await this.tripRepository.findOne({
      where: { id: tripId, userId },
    });
    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    const itinerary = await this.itineraryRepository.findOne({
      where: { tripId },
      order: { createdAt: 'DESC' },
    });
    if (!itinerary) {
      throw new NotFoundException('Itinerary not found — generate one first');
    }
    return itinerary;
  }

  async deleteTrip(tripId: string, userId: string): Promise<void> {
    const trip = await this.tripRepository.findOne({
      where: { id: tripId, userId },
    });
    if (!trip) {
      throw new NotFoundException('Trip not found');
    }
    await this.tripRepository.remove(trip);
  }
}
