import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AuthService } from './service/auth.service';
import { AuthController } from './controller/auth.controller';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '30m' },
    }),
    /* 
      if other module is exporting a provider, you can use them in this module 
      By simply importing the module. 
    */
    UserModule
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}


