import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { Socket } from "socket.io";
import { CommonService } from "src/common/common.service";
import { ConnectionGateway } from "src/connection/connection.gateway";
import { UserInfoDto } from "src/dto/user/userSocket";

@Injectable()
export class ConnectionService {
  constructor(
      private readonly commonService: CommonService,
      // private readonly connectionGateWay: ConnectionGateway
      @Inject(forwardRef(() => ConnectionGateway))
      private readonly connectionGateway: ConnectionGateway,
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

  async findConnection (userInfo: UserInfoDto, client: Socket) {
    const connectedPartner: any = await this.commonService.findUserConnection(userInfo)
    if(connectedPartner) {
      console.log(connectedPartner);
      
      const connectedPartnerSocket = await this.commonService.getUserSocket(connectedPartner.email);
      this.connectionGateway.sendEventToClient(client.id, 'matchFound' , connectedPartner)
      this.connectionGateway.sendEventToClient(connectedPartnerSocket.socketId, 'matchFound' , {email: userInfo.email,name: userInfo.fullName})

    } else {
      await this.commonService.saveUserToConnectionPool(userInfo)
    }
  }
}