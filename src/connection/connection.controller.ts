import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { CommonService } from "src/common/common.service";
import { ConnectionService } from "./connection.service";
import { AuthGuard } from "@nestjs/passport";
import { JwtAuthGuard } from "src/Guards/jwt-auth.guard";
import { UserInfoDto } from "src/dto/user/userSocket";

@Controller()
export class ConnectionController {
    constructor(private readonly connectionService: ConnectionService) {  }

    @Post('/registerNewConnection')
    @UseGuards(JwtAuthGuard)
    registerNewConnection(@Body() body:UserInfoDto) {
        return this.connectionService.registerConnection(body)
    }

    @Post('deleteConnectionRequest') 
    @UseGuards(JwtAuthGuard)
    deleteConnectionRequest(@Body() body:any) {
        return this.connectionService.deleteConnectionRequest(body)
    }
}