import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt'; // Import JwtService
import { Injectable } from '@nestjs/common';
import { CommonService } from 'src/common/common.service';

@Injectable()
@WebSocketGateway({
  namespace: '/connection',
  cors: {
    origin: '*',
  },
})
export class ConnectionGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    // Store the mapping of username to socketId
    private userSockets = new Map<string, string>();

    constructor(
        private readonly jwtService: JwtService,
        private readonly commonService: CommonService
    ) {}

  async handleConnection(client: Socket) {
    try {
        const token = client.handshake.headers.authorization?.split(' ')[1]; // Extract Bearer token
        if (!token) {
            console.log('No token provided, disconnecting client');
            client.disconnect();
            return;
        }
    } catch (error) {
        console.log('Invalid token, disconnecting client', error);
        client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    
    // Remove the socket from the mapping when the client disconnects
    for (const [username, socketId] of this.userSockets.entries()) {
      if (socketId === client.id) {
        this.userSockets.delete(username);
        console.log(`User ${username} disconnected.`);
        break;
      }
    }
  }

  @SubscribeMessage('send_message')
  handleMessage(@MessageBody() { toUsername, message }: { toUsername: string, message: string }, @ConnectedSocket() client: Socket) {
    const receiverSocketId = this.userSockets.get(toUsername);

    if (receiverSocketId) {
      // Send the message to the specific recipient
      this.server.to(receiverSocketId).emit('receive_message', { from: client.id, message });
      console.log(`Message sent from ${client.id} to ${toUsername}: ${message}`);
    } else {
      console.log(`User ${toUsername} not connected.`);
      client.emit('error', 'Recipient is not connected.');
    }
  }

    @SubscribeMessage('addToRedis')
    handleSetToRedis(@MessageBody() userInfo: any, @ConnectedSocket() client: Socket) {
        console.log(`Received userInfo from client ${client.id}:`, userInfo);

        const username = userInfo.email; // or whatever field you send
        if (username) {
            // Save the socket mapping
            this.commonService.setUserSocket(userInfo.email, {userInfo, socketId: client.id})
        }
    }

    @SubscribeMessage('removeFromRedis')
    handleRemoveFromredis(@MessageBody() userInfo: any, @ConnectedSocket() client: Socket) {
        console.log(`Deleting userInfo from client ${client.id}:`, userInfo);
        const username = userInfo.email;
        if (username) {
            this.commonService.delUserSocket(userInfo.email)
        }
    }

    // Method to send events to a specific client based on their socket ID
    sendEventToClient(clientId: string, event: string, payload: any) {
        this.server.to(clientId).emit(event, payload);
    }
}
