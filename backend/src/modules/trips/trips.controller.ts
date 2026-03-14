import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TripsService } from './trips.service.js';
import { CreateTripDto } from './dto/create-trip.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { User } from '../auth/entities/user.entity.js';

@ApiTags('Trips')
@Controller('trips')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new trip' })
  async createTrip(@CurrentUser() user: User, @Body() dto: CreateTripDto) {
    return this.tripsService.createTrip(user.id, dto);
  }

  @Post(':id/generate')
  @ApiOperation({ summary: 'Generate AI itinerary for a trip' })
  async generateItinerary(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ) {
    return this.tripsService.generateItinerary(id, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all trips for current user' })
  async getUserTrips(@CurrentUser() user: User) {
    return this.tripsService.getUserTrips(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific trip' })
  async getTrip(@CurrentUser() user: User, @Param('id') id: string) {
    return this.tripsService.getTripById(id, user.id);
  }

  @Get(':id/itinerary')
  @ApiOperation({ summary: 'Get the latest itinerary for a trip' })
  async getItinerary(@CurrentUser() user: User, @Param('id') id: string) {
    return this.tripsService.getItinerary(id, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a trip' })
  async deleteTrip(@CurrentUser() user: User, @Param('id') id: string) {
    await this.tripsService.deleteTrip(id, user.id);
    return { message: 'Trip deleted successfully' };
  }
}
