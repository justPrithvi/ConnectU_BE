import { Module } from "@nestjs/common";
import { ConnectionController } from "./connection.controller";
import { ConnectionService } from "./connection.service";
import { CommonModule } from "src/common/common.module";
import { ConnectionGateway } from "src/gateway/connection.gateway";


@Module({
    imports:[
        CommonModule, 
    ],
    controllers:[ConnectionController],
    providers:[ConnectionService],
    exports:[ConnectionService],

})

export class ConnectionModule {}