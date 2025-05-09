import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt'; // Import JwtService
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { CommonService } from 'src/common/common.service';
import { UserInfoDto, UserSocketDto } from 'src/dto/user/userSocket';
import { ConnectionService } from 'src/connection/connection.service';
import { userInfo } from 'os';
import { MessageDto } from 'src/dto/Message.dto';
import { MessageService } from 'src/message/messege.service';
import { OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

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

    private redisClient: Redis
    onModuleInit() {
        this.listenForMessageEvents();
    }
    constructor(
        private readonly jwtService: JwtService,
        private readonly commonService: CommonService,
        @Inject(forwardRef(() => ConnectionService))
        private readonly connectionService: ConnectionService,
        private readonly messgaeService: MessageService,
    ) {
        this.redisClient = new Redis();
    }

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
            client.emit('auth_error', 'Token expired or invalid');
            client.disconnect();
        }
    }

    handleDisconnect(client: Socket) {
        console.log(`Client disconnected: ${client.id}`);
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

    @SubscribeMessage('sendMessage')
    async sendMessage(@MessageBody() newMsg: MessageDto, @ConnectedSocket() client: Socket) {        
        await this.messgaeService.saveMessageToDB(newMsg);
    }

    private listenForMessageEvents() {
        this.redisClient.subscribe('message.saved', (err, count) => {
            if (err) {
                console.error("Error subscribing to Redis channel:", err);
                return;
            }
            console.log(`Subscribed to ${count} channel(s).`);
        });

        this.redisClient.on('message', async (channel, message) => {            
            if (channel === 'message.saved') {
                const newMsg: MessageDto = JSON.parse(message);
                const receiverSocket = await this.commonService.getUserSocket(newMsg.to) 
                this.sendEventToClient(receiverSocket.socketId, "receive_message", newMsg.text)        
            }
        });
    }


  

    @SubscribeMessage('removeSocketMap')
    handleRemoveSocketeMap(@MessageBody() userEmail: string, @ConnectedSocket() client: Socket) {        
        if (userEmail) {
            this.commonService.delUserSocket(userEmail)
        }
    } 
    @SubscribeMessage('removeFromRedis')
    handleRemoveFromredis(@MessageBody() userInfo: UserInfoDto, @ConnectedSocket() client: Socket) {
        // console.log(`Deleting userInfo from redis ${client.id}:`, userInfo);
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
