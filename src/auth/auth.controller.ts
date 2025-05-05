import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../Guards/jwt-auth.guard'; // import your JWT guard
import { Controller, Post, Body, Get, Req, UseGuards, Res } from '@nestjs/common';
import { Response, Request } from 'express'; // ✅ Import from express
import { LoginRequestDto, SignupRequestDto } from './dto/userLoginRequest.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  signup(@Body() body: SignupRequestDto) {
    return this.authService.signup(body.fullName, body.email, body.password);
  }

  @Post('login')
  async login(
    @Body() body: LoginRequestDto,
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
