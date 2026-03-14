import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Trip } from '../../trips/entities/trip.entity.js';
import { SavedPlace } from '../../trips/entities/saved-place.entity.js';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  name!: string;

  @Column({ nullable: true })
  passwordHash!: string;

  @Column({ nullable: true })
  googleId!: string;

  @Column({ nullable: true })
  avatar!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => Trip, (trip) => trip.user)
  trips!: Trip[];

  @OneToMany(() => SavedPlace, (place) => place.user)
  savedPlaces!: SavedPlace[];
}
