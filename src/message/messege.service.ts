import { forwardRef, Inject, Injectable } from "@nestjs/common";

import Redis from "ioredis";
import { ConnectionGateway } from "src/connection/connection.gateway";
import { MessageDto } from "src/dto/Message.dto";
import { MessageRepository } from "src/repositories/message.repository";
import {Message} from '../entities/message.entity'
@Injectable()
export class MessageService {
    private redisClient: Redis
    constructor(
        private readonly messageRepository: MessageRepository
    ) {
        this.redisClient = new Redis()

    }

    async saveMessageToDB (msg: MessageDto) {
        const messageToSave: Partial<Message> = {
            to: msg.to,
            from: msg.from,
            conversationId: msg.from + '-' + msg.to,
            text: msg.text
        }
        this.messageRepository.createMessage(messageToSave)
        this.redisClient.publish('message.saved', JSON.stringify(msg));
    }
}