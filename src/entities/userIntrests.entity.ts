import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Interest } from './intrests.entity';

@Entity()
export class UserInterests {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  addedAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' }) // ✅ Enable relation
  @JoinColumn({ name: 'userId' }) // Will create userId FK
  user: User;

  @ManyToOne(() => Interest, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'interestId' }) // Will create interestId FK
  interest: Interest;
}
