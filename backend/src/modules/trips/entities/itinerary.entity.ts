import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Trip } from './trip.entity.js';

@Entity('itineraries')
export class Itinerary {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  tripId!: string;

  @ManyToOne(() => Trip, (trip) => trip.itineraries, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tripId' })
  trip!: Trip;

  @Column({ type: 'jsonb' })
  rawJson!: Record<string, any>;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  totalCost!: number;

  @Column({ nullable: true })
  geminiModelUsed!: string;

  @Column({ nullable: true })
  tokensUsed!: number;

  @CreateDateColumn()
  createdAt!: Date;
}
