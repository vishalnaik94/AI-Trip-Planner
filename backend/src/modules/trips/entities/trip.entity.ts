import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity.js';
import { Itinerary } from './itinerary.entity.js';

export enum TripStatus {
  DRAFT = 'draft',
  GENERATING = 'generating',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum BudgetLevel {
  BUDGET = 'budget',
  MID_RANGE = 'mid-range',
  LUXURY = 'luxury',
}

export enum TravelerType {
  SOLO = 'solo',
  COUPLE = 'couple',
  FAMILY = 'family',
  GROUP = 'group',
}

@Entity('trips')
export class Trip {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  userId!: string;

  @ManyToOne(() => User, (user) => user.trips, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column()
  destination!: string;

  @Column({ type: 'date' })
  startDate!: string;

  @Column({ type: 'date' })
  endDate!: string;

  @Column({ type: 'enum', enum: BudgetLevel, default: BudgetLevel.MID_RANGE })
  budget!: BudgetLevel;

  @Column({ type: 'enum', enum: TravelerType, default: TravelerType.SOLO })
  travelerType!: TravelerType;

  @Column('text', { array: true, default: '{}' })
  interests!: string[];

  @Column({ nullable: true })
  specialRequirements!: string;

  @Column({ type: 'enum', enum: TripStatus, default: TripStatus.DRAFT })
  status!: TripStatus;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => Itinerary, (itinerary) => itinerary.trip)
  itineraries!: Itinerary[];
}
