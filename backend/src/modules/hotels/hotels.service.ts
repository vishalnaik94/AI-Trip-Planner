import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface HotelSearchParams {
  destination: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  budgetLevel?: string;
}

export interface HotelResult {
  name: string;
  rating: number;
  pricePerNight: number;
  currency: string;
  address: string;
  amenities: string[];
  imageUrl?: string;
}

@Injectable()
export class HotelsService {
  private readonly logger = new Logger(HotelsService.name);

  constructor(private readonly configService: ConfigService) {}

  async searchHotels(params: HotelSearchParams): Promise<HotelResult[]> {
    // In production, this would call Booking.com or Hotels.com API
    // For now, returning intelligent mock data based on budget level
    this.logger.log(`Searching hotels in ${params.destination}`);

    const budgetMultiplier =
      params.budgetLevel === 'luxury' ? 3 :
      params.budgetLevel === 'mid-range' ? 2 : 1;

    const basePrice = 50 * budgetMultiplier;

    return [
      {
        name: `${params.destination} Grand Hotel`,
        rating: 3.5 + budgetMultiplier * 0.5,
        pricePerNight: basePrice + 30,
        currency: 'USD',
        address: `123 Main Street, ${params.destination}`,
        amenities: ['WiFi', 'Pool', 'Restaurant', 'Parking'],
      },
      {
        name: `${params.destination} Plaza Resort`,
        rating: 3 + budgetMultiplier * 0.5,
        pricePerNight: basePrice + 15,
        currency: 'USD',
        address: `456 Beach Road, ${params.destination}`,
        amenities: ['WiFi', 'Gym', 'Spa', 'Room Service'],
      },
      {
        name: `The ${params.destination} Boutique Inn`,
        rating: 4 + budgetMultiplier * 0.3,
        pricePerNight: basePrice + 50,
        currency: 'USD',
        address: `789 Heritage Lane, ${params.destination}`,
        amenities: ['WiFi', 'Breakfast', 'Concierge', 'Bar'],
      },
    ];
  }
}
