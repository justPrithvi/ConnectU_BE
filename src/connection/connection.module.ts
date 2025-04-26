import { Module } from "@nestjs/common";
import { ConnectionController } from "./connection.controller";
import { ConnectionService } from "./connection.service";
import { CommonModule } from "src/common/common.module";


@Module({
    imports:[
        CommonModule
    ],
    controllers:[ConnectionController],
    providers:[ConnectionService],
    exports:[],

})

export class ConnectionModule {}