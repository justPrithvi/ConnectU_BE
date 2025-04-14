import { AuthService } from '../service/auth.service';
import { JwtAuthGuard } from '../../Guards/jwt-auth.guard'; // import your JWT guard
import { Controller, Post, Body, Get, Req, UseGuards, Res } from '@nestjs/common';
import { Response, Request } from 'express'; // ✅ Import from express

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  signup(@Body() body: { username: string; email: string; password: string }) {
    return this.authService.signup(body.username, body.email, body.password);
  }

  @Post('login')
  async login(
    @Body() body: { email: string; password: string },
    @Res({ passthrough: true }) res: Response
  ) {    
    const data = await this.authService.login(body.email, body.password);
    return { tokens: data.tokens, user: data.user }; // Send accessToken to frontend
  }
  

  @Post('refresh')
  async refreshToken(
    @Body() Body: {refreshToken:string}
  ) {
    const token = Body.refreshToken
    if (!token) {
      return { message: 'Token required' };
    }
    return this.authService.refreshToken(token);
  }
  

  @Get('validate')
  @UseGuards(JwtAuthGuard)
  validateToken(@Req() req: Request) {
    return { valid: true };
  }
}
