import { Injectable, NestInterceptor, ExecutionContext, CallHandler, UnauthorizedException } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthInterceptor implements NestInterceptor {
  constructor(private jwtService: JwtService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const token = request.cookies.jwt;

    if (!token) {
      return next.handle();
    }

    try {
      const decoded = this.jwtService.decode(token) as { exp: number; username: string };
      if (!decoded || !decoded.exp) {
        throw new UnauthorizedException('Invalid token');
      }

      const currentTime = Math.floor(Date.now() / 1000);
      const timeLeft = decoded.exp - currentTime;

      if (timeLeft < 300) {
        return throwError(() => new UnauthorizedException('Token expired, please refresh'));
      }
    } catch (err) {
      return throwError(() => new UnauthorizedException('Token error'));
    }

    return next.handle();
  }
}
