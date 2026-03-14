import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { FlightsService } from './flights.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@ApiTags('Flights')
@Controller('flights')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FlightsController {
  constructor(private readonly flightsService: FlightsService) {}

  @Get('search')
  @ApiOperation({ summary: 'Search for flights' })
  @ApiQuery({ name: 'origin', example: 'DEL' })
  @ApiQuery({ name: 'destination', example: 'LON' })
  @ApiQuery({ name: 'departureDate', example: '2026-04-15' })
  @ApiQuery({ name: 'returnDate', required: false, example: '2026-04-22' })
  @ApiQuery({ name: 'adults', example: 1, required: false })
  async searchFlights(
    @Query('origin') origin: string,
    @Query('destination') destination: string,
    @Query('departureDate') departureDate: string,
    @Query('returnDate') returnDate?: string,
    @Query('adults') adults?: number,
  ) {
    return this.flightsService.searchFlights({
      origin,
      destination,
      departureDate,
      returnDate,
      adults: adults || 1,
    });
  }
}
