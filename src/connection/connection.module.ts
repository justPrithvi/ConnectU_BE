import { forwardRef, Module } from "@nestjs/common";
import { ConnectionController } from "./connection.controller";
import { ConnectionService } from "./connection.service";
import { CommonModule } from "src/common/common.module";
import { ConnectionGateway } from "src/connection/connection.gateway";
import { AuthModule } from "src/auth/auth.module";
import { JwtService } from "@nestjs/jwt";
import { MessageModule } from "src/message/message.module";


@Module({
    imports:[
        CommonModule, 
        AuthModule, 
        MessageModule
    ],
    controllers:[ConnectionController],
    providers: [
        ConnectionService,
        ConnectionGateway,
        JwtService, 
      ],
    
    exports:[ConnectionService, ConnectionGateway],

})

export class ConnectionModule {}