import { Injectable } from "@nestjs/common";
import { GenderRepository } from "src/repositories/gender.repository";
import { IntrestRepository } from "src/repositories/intrests.repository";
import * as AWS from 'aws-sdk'; // Correct import for AWS SDK v2
import Redis from 'ioredis'; // Redis import
import { UserInfoDto, UserSocketDto } from "src/dto/user/userSocket";

@Injectable()
export class CommonService {
  private s3Instance: AWS.S3;
  private SQSInstance: AWS.SQS;
  private redisClient: Redis;

  constructor(
    private readonly intrestRepo: IntrestRepository, // or any other dependencies
    private readonly genderRepo: GenderRepository,
  ) {
    // AWS configuration
    AWS.config.update({
      region: process.env.AWS_REGION, // e.g., 'us-west-2'
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });
    this.s3Instance = new AWS.S3(); // S3 instance initialization
    this.SQSInstance = new AWS.SQS();

    // Redis initialization
    this.redisClient = new Redis({
      host: process.env.REDIS_HOST || 'localhost', // Adjust as per your setup
      port: Number(process.env.REDIS_PORT) || 6379, // Default Redis port
      password: process.env.REDIS_PASSWORD, // Optional if you use password protection
    });
  }

  // Example function to get interests from the database
  async getInrests() {        
    return this.intrestRepo.findAll();
  }

  // Example function to get genders from the database
  async getGenders() {
    return this.genderRepo.findAll();
  }

  // AWS S3 instance
  async gets3Instance() {
    return this.s3Instance; // Return the S3 instance
  }

  // AWS SQS instance
  async getSQSInstance() {
    return this.SQSInstance;
  }

  // Sqs Polling
  async pollMessagesFromSQS() {
    try {
      const params: AWS.SQS.ReceiveMessageRequest = {
        QueueUrl: process.env.QUEUE_URL, // or pass this as a parameter if you want
        MaxNumberOfMessages: 10,
        WaitTimeSeconds: 20, // Long polling for better efficiency
        VisibilityTimeout: 30,
      };

      const data = await this.SQSInstance.receiveMessage(params).promise();
      console.log(data.Messages);
      
      if (data.Messages) {
        for (const message of data.Messages) {
          console.log('Received message:', message.Body);
        }
      } else {
        console.log('No messages found in SQS.');
      }
    } catch (error) {
      console.error('Error while polling messages from SQS:', error);
    }
  }


  startPollingSQS() {
    setInterval(async () => {
      console.log("Aam i polling");
      await this.pollMessagesFromSQS();
    }, 5000); // every 5 seconds
  }


  // Helper function to delete message
  private async deleteMessageFromSQS(receiptHandle: string) {
    const params: AWS.SQS.DeleteMessageRequest = {
      QueueUrl: process.env.SQS_QUEUE_URL,
      ReceiptHandle: receiptHandle,
    };

    try {
      await this.SQSInstance.deleteMessage(params).promise();
      console.log('Deleted message from SQS.');
    } catch (error) {
      console.error('Error deleting message from SQS:', error);
    }
  }





  // Set a key-value pair in Redis
  async setUserSocket(key: string, userInfo: UserInfoDto, socketId: string) {
    try {
      const data = JSON.stringify({
        userInfo,
        socketId
      })
      await this.redisClient.set(key, data);
    } catch (error) {
      console.error("Error setting data in Redis:", error);
      throw new Error("Failed to set data in Redis.");
    }
  }

  // Get a value by key from Redis
  async getUserSocket(key: string): Promise<string | null> {
    try {
      return await this.redisClient.get(key);
    } catch (error) {
      console.error("Error getting data from Redis:", error);
      throw new Error("Failed to get data from Redis.");
    }
  }

  // Delete a key from Redis
  async delUserSocket(key: string) {
    try {
      await this.redisClient.del(key);
    } catch (error) {
      console.error("Error deleting data from Redis:", error);
      throw new Error("Failed to delete data from Redis.");
    }
  }

  // Close the Redis connection (optional)
  async quitRedis() {
    try {
      await this.redisClient.quit();
    } catch (error) {
      console.error("Error closing Redis connection:", error);
      throw new Error("Failed to close Redis connection.");
    }
  }
}
