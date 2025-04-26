import { Body, Controller, Get, Post, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { UserService } from "./user.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { JwtAuthGuard } from "../Guards/jwt-auth.guard";

@Controller('user')
export class UserController {
  constructor(private readonly userService:UserService) {}

  @Post('')
  async getUser(@Body() body: {email: string}) {
      return this.userService.getUser(body)
  }

  @Post('profile')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image')) // "image" is the key used in FormData.append()
  async postUserProfile(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
  ) {
    return await this.userService.postUserProfile(body, file)
  }
}