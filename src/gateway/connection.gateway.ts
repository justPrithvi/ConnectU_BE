import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt'; // Import JwtService
import { Injectable } from '@nestjs/common';
import { CommonService } from 'src/common/common.service';
import { UserInfoDto, UserSocketDto } from 'src/dto/user/userSocket';
import { ConnectionService } from 'src/connection/connection.service';

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
        private readonly commonService: CommonService,
        private readonly connectionService: ConnectionService
    ) {}

    async handleConnection(client: Socket) {
        console.log(`Client connected: ${client.id}`);
        try {
            const token = client.handshake.headers.authorization?.split(' ')[1]; // Extract Bearer token
            const decoded = this.jwtService.verify(token, { secret: process.env.JWT_SECRET });
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
        // console.log(`Client disconnected: ${client.id}`);
        for (const [username, socketId] of this.userSockets.entries()) {
            if (socketId === client.id) {
                this.userSockets.delete(username);
                console.log(`User ${username} disconnected.`);
                break;
            }
        }
    }

    @SubscribeMessage('addToRedis')
    handleSetToRedis(@MessageBody() userInfo: UserInfoDto, @ConnectedSocket() client: Socket) {
        // console.log(`Save userInfo to redis ${client.id}:`, userInfo);
        const username = userInfo.email;
        if (username) {
            this.commonService.saveUserSocket(userInfo.email, userInfo, client.id)
            this.connectionService.findConnection(userInfo, client);
        }
    }

    @SubscribeMessage('removeFromRedis')
    handleRemoveFromredis(@MessageBody() userInfo: UserInfoDto, @ConnectedSocket() client: Socket) {
        console.log(`Deleting userInfo from redis ${client.id}:`, userInfo);
        const username = userInfo.email;
        if (username) {
            this.commonService.delUserSocket(userInfo.email)
            this.commonService.deleteUserFromConnectionPool(userInfo)
        }
    }

    // Method to send events to a specific client based on their socket ID
    sendEventToClient(clientId: string, event: string, payload: any) {
        this.server.to(clientId).emit(event, payload);
    }
}
