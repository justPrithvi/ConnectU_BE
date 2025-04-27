import { Injectable } from "@nestjs/common";
import { CommonService } from "src/common/common.service";
import { UserInterests } from "src/entities/userIntrests.entity";

@Injectable()
export class ConnectionService {
    constructor(
        private readonly commonService: CommonService
    ) {}
    async registerConnection(body: any) {
        const SQS = await this.commonService.getSQSInstance();
        const payload = {
            email: body.email,
            gender:body.gender.id,
            userInterests:body.interests.map(element => {
                return element.interest.id
            }),
            selectedInterests: body.selectedInterests
        }
         
        const params = {
          QueueUrl: process.env.QUEUE_URL, // your queue URL
          MessageBody: JSON.stringify(payload),
          DelaySeconds: 10, // No delay, instant send. (can be 0–900 seconds if you want delay)
        };

        try {
          const result = await SQS.sendMessage(params).promise();
          console.log('Message sent to SQS:', result.MessageId);
          return { messageId: result.MessageId };
        } catch (error) {
          console.error('Error sending message to SQS:', error);
          throw new Error('Failed to send message to SQS');
        }
    }

    async deleteConnectionRequest(body: any) {
        
    }
}