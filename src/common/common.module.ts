import { Module } from "@nestjs/common";
import { CommonController } from "./common.controller";
import { CommonService } from "./common.service";
import { IntrestRepository } from "src/repositories/intrests.repository";
import { GenderRepository } from "src/repositories/gender.repository";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Interest } from "src/entities/intrests.entity";
import { Gender } from "src/entities/gender.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([Interest, Gender])
    ], 
    controllers: [CommonController],
    providers: [CommonService, IntrestRepository, GenderRepository],
    exports: [CommonService]
})
export class CommonModule {};