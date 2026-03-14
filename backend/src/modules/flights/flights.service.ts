import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface FlightSearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  adults: number;
  travelClass?: string;
}

export interface FlightResult {
  airline: string;
  flightNumber: string;
  departure: { airport: string; time: string };
  arrival: { airport: string; time: string };
  duration: string;
  price: { amount: number; currency: string };
  stops: number;
}

@Injectable()
export class FlightsService {
  private readonly logger = new Logger(FlightsService.name);
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;
  private readonly baseUrl = 'https://test.api.amadeus.com/v2';
  private readonly authUrl = 'https://test.api.amadeus.com/v1/security/oauth2/token';

  constructor(private readonly configService: ConfigService) {}

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    const clientId = this.configService.get<string>('AMADEUS_CLIENT_ID', '');
    const clientSecret = this.configService.get<string>('AMADEUS_CLIENT_SECRET', '');

    if (!clientId || clientId === 'your_amadeus_id') {
      this.logger.warn('Amadeus credentials not configured');
      return '';
    }

    try {
      const response = await axios.post(
        this.authUrl,
        new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: clientId,
          client_secret: clientSecret,
        }),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
      );

      this.accessToken = response.data.access_token;
      this.tokenExpiry = Date.now() + response.data.expires_in * 1000 - 60000;
      return this.accessToken!;
    } catch (error) {
      this.logger.error('Failed to get Amadeus access token', error);
      return '';
    }
  }

  async searchFlights(params: FlightSearchParams): Promise<FlightResult[]> {
    const token = await this.getAccessToken();
    if (!token) {
      this.logger.warn('No Amadeus token — returning mock flight data');
      return this.getMockFlights(params);
    }

    try {
      const response = await axios.get(`${this.baseUrl}/shopping/flight-offers`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          originLocationCode: params.origin,
          destinationLocationCode: params.destination,
          departureDate: params.departureDate,
          returnDate: params.returnDate,
          adults: params.adults,
          travelClass: params.travelClass || 'ECONOMY',
          max: 10,
        },
      });

      return response.data.data.map((offer: any) => {
        const segment = offer.itineraries[0].segments[0];
        return {
          airline: segment.carrierCode,
          flightNumber: `${segment.carrierCode}${segment.number}`,
          departure: {
            airport: segment.departure.iataCode,
            time: segment.departure.at,
          },
          arrival: {
            airport: segment.arrival.iataCode,
            time: segment.arrival.at,
          },
          duration: offer.itineraries[0].duration,
          price: {
            amount: parseFloat(offer.price.total),
            currency: offer.price.currency,
          },
          stops: offer.itineraries[0].segments.length - 1,
        };
      });
    } catch (error) {
      this.logger.error('Flight search failed', error);
      return this.getMockFlights(params);
    }
  }

  private getMockFlights(params: FlightSearchParams): FlightResult[] {
    return [
      {
        airline: 'AI',
        flightNumber: 'AI101',
        departure: { airport: params.origin, time: `${params.departureDate}T08:00:00` },
        arrival: { airport: params.destination, time: `${params.departureDate}T12:00:00` },
        duration: 'PT4H0M',
        price: { amount: 350, currency: 'USD' },
        stops: 0,
      },
      {
        airline: 'EK',
        flightNumber: 'EK505',
        departure: { airport: params.origin, time: `${params.departureDate}T14:00:00` },
        arrival: { airport: params.destination, time: `${params.departureDate}T20:30:00` },
        duration: 'PT6H30M',
        price: { amount: 280, currency: 'USD' },
        stops: 1,
      },
    ];
  }
}
