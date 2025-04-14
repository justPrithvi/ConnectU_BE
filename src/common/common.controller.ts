import { Body, Controller, Get, Post } from "@nestjs/common";
import { CommonService } from "./common.service";


@Controller('')
export class CommonController {
    constructor(private readonly commonService: CommonService) {}

    @Get('intrests')
    getInrests() {
        return this.commonService.getInrests()
    }

    @Get('genders')
    getGenders() {
        return this.commonService.getGenders()
    }
}