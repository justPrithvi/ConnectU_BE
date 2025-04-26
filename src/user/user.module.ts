import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "src/entities/user.entity";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { UserRepository } from "src/repositories/user.repository";
import { UserInterests } from "src/entities/userIntrests.entity";
import { UserPhotos } from "src/entities/userPhotos.entity";
import { CommonModule } from "src/common/common.module";

@Module({
    imports: [
        // Register a entity to a module
        TypeOrmModule.forFeature([User, UserInterests, UserPhotos]),
        CommonModule
    ],
    controllers: [UserController],
    // registers the providers of this module
    providers: [UserService, UserRepository, UserInterests],
    /*
            If you want a provider of this module to be used in other module export it. 
            then just import the module in other module to use it. 
            We dont export the userRepobecause we dont want to expose it to other service
    */
    exports: [UserService]
    
})
export class UserModule {}