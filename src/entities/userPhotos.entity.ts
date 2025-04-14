import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class UserPhotos {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  url: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' }) // ✅ Required for FK creation
  @JoinColumn({ name: 'userId' }) // This becomes the foreign key column
  user: User;

  @Column({ type: 'boolean' })
  isPrimary: boolean;

  @CreateDateColumn()
  createddAt: Date;
}
