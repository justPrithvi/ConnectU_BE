import { Injectable } from "@nestjs/common";
import { GenderRepository } from "src/repositories/gender.repository";
import { IntrestRepository } from "src/repositories/intrests.repository";
import * as AWS from 'aws-sdk'; // Correct import for AWS SDK v2

@Injectable()
export class CommonService {
    private s3Instance: AWS.S3;
    private SQSInstance: AWS.SQS
    constructor(
        private readonly intrestRepo: IntrestRepository, // or any other dependencies
        private readonly genderRepo: GenderRepository,
    ) {
        // Correct initialization
        AWS.config.update({
            region: process.env.AWS_REGION, // e.g., 'us-west-2'
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        });
        this.s3Instance = new AWS.S3(); // S3 instance initialization
        this.SQSInstance = new AWS.SQS();
    }
    
    async getInrests() {        
        return this.intrestRepo.findAll();
    }

    async getGenders() {
        return this.genderRepo.findAll();
    }

    async gets3Instance() {
        return this.s3Instance; // Return the S3 instance
    }

    async getSQSInstance() {
        return this.SQSInstance;
    }
}
