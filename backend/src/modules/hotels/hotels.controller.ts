import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { HotelsService } from './hotels.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@ApiTags('Hotels')
@Controller('hotels')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class HotelsController {
  constructor(private readonly hotelsService: HotelsService) {}

  @Get('search')
  @ApiOperation({ summary: 'Search for hotels' })
  @ApiQuery({ name: 'destination', example: 'Paris' })
  @ApiQuery({ name: 'checkIn', example: '2026-04-15' })
  @ApiQuery({ name: 'checkOut', example: '2026-04-22' })
  @ApiQuery({ name: 'guests', example: 2, required: false })
  @ApiQuery({ name: 'budgetLevel', required: false, example: 'mid-range' })
  async searchHotels(
    @Query('destination') destination: string,
    @Query('checkIn') checkIn: string,
    @Query('checkOut') checkOut: string,
    @Query('guests') guests?: number,
    @Query('budgetLevel') budgetLevel?: string,
  ) {
    return this.hotelsService.searchHotels({
      destination,
      checkIn,
      checkOut,
      guests: guests || 2,
      budgetLevel,
    });
  }
}
