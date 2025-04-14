import { Injectable } from "@nestjs/common";
import { Interest } from "src/entities/intrests.entity";
import { DataSource, Repository } from "typeorm";

@Injectable()
export class IntrestRepository {
    private readonly repository: Repository<Interest>
    constructor(private readonly dataSource: DataSource) {
        this.repository = dataSource.getRepository(Interest)
    }

    async findAll() {
        return this.repository.find()
    }
}