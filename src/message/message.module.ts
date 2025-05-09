import { Module } from "@nestjs/common";
import { MessageController } from "./message.controller";
import { MessageService } from "./messege.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Message } from "src/entities/message.entity";
import { MessageRepository } from "src/repositories/message.repository";

@Module({
    imports:[
        TypeOrmModule.forFeature([Message])
    ],
    controllers:[MessageController],
    providers:[MessageService, MessageRepository],
    exports:[MessageService]
})
export class MessageModule {}