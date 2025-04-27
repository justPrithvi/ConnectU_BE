import {
    WebSocketGateway,
    SubscribeMessage,
    MessageBody,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
  } from '@nestjs/websockets';
  import { Server, Socket } from 'socket.io';
  
  @WebSocketGateway({
    namespace: '/connection',
    cors: {
      origin: '*',
    },
  })
  export class ConnectionGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;
  
    handleConnection(client: Socket) {
      console.log(`Client connected: ${client.id}`);
    }
  
    handleDisconnect(client: Socket) {
      console.log(`Client disconnected: ${client.id}`);
    }
  
    @SubscribeMessage('ping')
    handlePing(@MessageBody() data: any): string {
      console.log('Received ping:', data);
      return 'pong';
    }
  
    // You can add custom methods to emit events
    sendEventToClient(clientId: string, event: string, payload: any) {
      this.server.to(clientId).emit(event, payload);
    }
  }
  