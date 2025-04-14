import { Injectable } from "@nestjs/common";
import { Gender } from "src/entities/gender.entity";
import { User } from "src/entities/user.entity";
import { DataSource, Repository } from "typeorm";

@Injectable()
export class GenderRepository {
    private readonly repository: Repository<Gender>

    constructor (private readonly dataSource:DataSource) {
        this.repository = dataSource.getRepository(Gender)
    }

    async findAll() {
        return this.repository.find()
    }
}