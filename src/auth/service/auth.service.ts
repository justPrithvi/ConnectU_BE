import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { GlobalResponseDto } from 'src/globalDTO/response.dto';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService
  ) {}

  async signup(username: string, email: string, password: string) {
    try {
      const userExists = await this.userService.getUser({email});
      if (userExists) throw new BadRequestException("User already exists");

      const newUser = await this.userService.createUser({username, email, password});
      return new GlobalResponseDto("User created successfully", newUser);
    } catch (error) {
      console.error("Signup Error:", error);
      throw error;
    }
  }

  async login(email: string, password: string) {
    const user = await this.userService.getUser({email});    
    if (!user) throw new BadRequestException('User not found');
    if (user.password !== password) throw new BadRequestException('Invalid password');

    const tokens =  this.generateTokenResponse(email);
    return {tokens, user}
  }

  refreshToken(refreshToken: string) {
    try {
      const decoded = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      return this.generateTokenResponse(decoded.email);
    } catch (err) {
      console.error("Refresh token error:", err);
      throw new BadRequestException('Invalid or expired refresh token');
    }
  }

  generateTokenResponse(email: string) {
    const payload = { email };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '30m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }
}
