import { Injectable } from "@nestjs/common";
import { CommonService } from "src/common/common.service";
import { UserRepository } from "src/repositories/user.repository";

@Injectable()
export class UserService {
    constructor (
        private userRepo: UserRepository,
        private commonService: CommonService
    ) {}
      

    async getUser(body: {email:string}) {
        const user =  await this.userRepo.findByEmail(body.email)
        return user
    }

    async createUser(body: {fullName: string, email: string, password: string}) {
      return await this.userRepo.createUser(body.fullName, body.email, body.password);
    }

    private async uploadFileToS3(file: any): Promise<string> {
        if (!file) {
          return ''
        }
    
        const s3 = await this.commonService.gets3Instance(); // Get S3 instance
    
        const fileName = `UserProfile/${Date.now()}-${file.originalname}`; // Unique file name
        const uploadParams = {
          Bucket: process.env.PROFILE_BUCKET, // S3 Bucket name from .env file
          Key: fileName, // Path inside the bucket
          Body: file.buffer, // The file buffer
          ContentType: file.mimetype, // MIME type (e.g., "image/jpeg")
        };
    
        try {
          const s3Response = await s3.upload(uploadParams).promise(); // Upload file to S3
          return s3Response.Location; // Return the URL of the uploaded file
        } catch (error) {
          console.error('Error uploading file to S3:', error);
          throw new Error('Error uploading file to S3');
        }
    }
    
    async postUserProfile(body: any, file: any) {
        const userIntrests = body.inetrests.split(',').map((i: string) => +i);
        body.inetrests = userIntrests;
        body.gender = +body.gender;

        // Upload to S3
        const fileUrl = await this.uploadFileToS3(file)
        console.log(fileUrl);
        
        body.profileUrl = fileUrl;

        const data =  await this.userRepo.saveUser(body)
        console.log(data);
        return data
        
    }
}