import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TripsController } from './trips.controller.js';
import { TripsService } from './trips.service.js';
import { Trip } from './entities/trip.entity.js';
import { Itinerary } from './entities/itinerary.entity.js';
import { SavedPlace } from './entities/saved-place.entity.js';
import { AiModule } from '../ai/ai.module.js';
import { RagModule } from '../rag/rag.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Trip, Itinerary, SavedPlace]),
    AiModule,
    RagModule,
  ],
  controllers: [TripsController],
  providers: [TripsService],
  exports: [TripsService],
})
export class TripsModule {}
