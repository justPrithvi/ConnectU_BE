// message.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from '../entities/message.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MessageRepository {
  constructor(
    @InjectRepository(Message)
    private readonly repo: Repository<Message>,
  ) {}

  createMessage(data: Partial<Message>): Promise<Message> {
    const msg = this.repo.create(data);
    return this.repo.save(msg);
  }
}
