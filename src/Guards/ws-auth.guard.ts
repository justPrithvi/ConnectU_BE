// src/guards/ws-auth.guard.ts
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Socket } from 'socket.io';

@Injectable()
export class WsAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const client: Socket = context.switchToWs().getClient();
    
    const token = client.handshake.headers['Authorization']; // Assuming token is sent in 'Authorization' header
    
    if (!token) {   
      return false; // Reject connection if no token
    }
    
    // Validate the token (this could be done with a service like JWT)
    // For now, just a simple check:
    if (token === 'valid_token') { // Replace with actual validation logic
      return true;
    }
    
    return false; // Reject if token is invalid
  }
}
