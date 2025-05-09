import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  from: string;

  @Column()
  to: string;

  @Column()
  text: string;
  
  @Column()
  conversationId: string;

  @CreateDateColumn()
  createdAt: Date;
}
