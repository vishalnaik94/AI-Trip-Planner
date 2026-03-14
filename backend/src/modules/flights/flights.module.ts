import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FlightsService } from './flights.service.js';
import { FlightsController } from './flights.controller.js';

@Module({
  imports: [ConfigModule],
  controllers: [FlightsController],
  providers: [FlightsService],
  exports: [FlightsService],
})
export class FlightsModule {}
