import { Injectable } from "@nestjs/common";
import { Socket } from "socket.io";
import { CommonService } from "src/common/common.service";
import { ConnectionGateway } from "src/gateway/connection.gateway";

@Injectable()
export class ConnectionService {
  constructor(
      private readonly commonService: CommonService,
      // private readonly connectionGateWay: ConnectionGateway
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

  async findConnection (userInfo: any, client: Socket) {
    console.log(userInfo, client.id);
    const userMood = userInfo.selectedInterests; // [2, 5]
    const userInterestIds = userInfo.interests.map((item:any) => item.interest.id);
    const key = `Mood:[${userMood.sort().join(',')}]-Interests:[${userInterestIds.sort().join(',')}]`;
    console.log(key);
    const connectedPartner = await this.commonService.findUserConnection(key)
    if(connectedPartner) {
      // this.connectionGateWay.sendEventToClient(client.id, 'matchFound' ,'udesh.raj@gmail.com')
    } else {
      await this.commonService.saveUserToConnectionPool(key, userInfo.email)
    }
  }
}