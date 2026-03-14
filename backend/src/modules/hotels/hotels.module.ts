import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HotelsService } from './hotels.service.js';
import { HotelsController } from './hotels.controller.js';

@Module({
  imports: [ConfigModule],
  controllers: [HotelsController],
  providers: [HotelsService],
  exports: [HotelsService],
})
export class HotelsModule {}
