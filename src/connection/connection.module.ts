import { Module } from "@nestjs/common";
import { ConnectionController } from "./connection.controller";
import { ConnectionService } from "./connection.service";
import { CommonModule } from "src/common/common.module";
import { ConnectionGateway } from "src/connection/connection.gateway";
import { AuthModule } from "src/auth/auth.module";
import { JwtService } from "@nestjs/jwt";


@Module({
    imports:[
        CommonModule, 
        AuthModule
    ],
    controllers:[ConnectionController],
    providers: [
        ConnectionService,
        ConnectionGateway,
        JwtService
      ],
    
    exports:[ConnectionService],

})

export class ConnectionModule {}