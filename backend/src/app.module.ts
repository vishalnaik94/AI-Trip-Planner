import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { TripsModule } from './modules/trips/trips.module.js';
import { AiModule } from './modules/ai/ai.module.js';
import { RagModule } from './modules/rag/rag.module.js';
import { FlightsModule } from './modules/flights/flights.module.js';
import { HotelsModule } from './modules/hotels/hotels.module.js';
import { getDatabaseConfig } from './config/database.config.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getDatabaseConfig,
    }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 30 }]),
    AuthModule,
    TripsModule,
    AiModule,
    RagModule,
    FlightsModule,
    HotelsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
