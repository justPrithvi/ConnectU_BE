import { Controller } from "@nestjs/common";
import { MessageService } from "./messege.service";

@Controller()
export class MessageController {
    constructor(
        private readonly messageService: MessageService
    ) {}
}