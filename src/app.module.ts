import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { JwtStrategy } from './Guards/jwt.strategy';
import { JwtAuthGuard } from './Guards/jwt-auth.guard';
import { UserModule } from './user/user.module';
import { CommonModule } from './common/common.module';
import { ConnectionModule } from './connection/connection.module';
import { ConnectionGateway } from './gateway/connection.gateway';

@Module({
  imports: [
    // Loads environment variables from .env file
    ConfigModule.forRoot({
      isGlobal: true, // makes the config accessible globally
      envFilePath: '.env',
    }),

    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      autoLoadEntities: true,  // Automatically load entities (models)
      synchronize: true,       // Set to false in production for safety
    }),
    // Register all your modules here. 
    AuthModule,
    UserModule,
    CommonModule,
    ConnectionModule
  ],
  providers: [   
    // Global injectables/providers . This is not ideal and need to change
    // Rather create a global module, Import global module here and them import it in other module to use the global providers 
    JwtStrategy, 
    JwtAuthGuard,
    ConnectionGateway
  ], 
  exports: [
    // if you want the registerd injectable to be used in the registerd modules
    JwtStrategy,
    JwtAuthGuard,
  ]
})
export class AppModule {}
