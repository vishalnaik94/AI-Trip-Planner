import {
  IsString,
  IsDateString,
  IsEnum,
  IsArray,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BudgetLevel, TravelerType } from '../entities/trip.entity.js';

export class CreateTripDto {
  @ApiProperty({ example: 'Paris, France' })
  @IsString()
  destination!: string;

  @ApiProperty({ example: '2026-04-15' })
  @IsDateString()
  startDate!: string;

  @ApiProperty({ example: '2026-04-22' })
  @IsDateString()
  endDate!: string;

  @ApiProperty({ enum: BudgetLevel, example: BudgetLevel.MID_RANGE })
  @IsEnum(BudgetLevel)
  budget!: BudgetLevel;

  @ApiProperty({ enum: TravelerType, example: TravelerType.COUPLE })
  @IsEnum(TravelerType)
  travelerType!: TravelerType;

  @ApiProperty({ example: ['culture', 'food', 'adventure'] })
  @IsArray()
  @IsString({ each: true })
  interests!: string[];

  @ApiPropertyOptional({ example: 'Vegetarian meals preferred' })
  @IsOptional()
  @IsString()
  specialRequirements?: string;
}
