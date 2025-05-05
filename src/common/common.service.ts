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
  private connectionPoolKey = 'connection-pool-map'

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
  async saveUserSocket(userEmail: string, userInfo: UserInfoDto, socketId: string) {
    const socketKey = 'user:socket:map'
    try {
      const existing = await this.redisClient.get(socketKey)
      const map = existing ? JSON.parse(existing) : {};

      map[userEmail] = {
        userInfo,
        socketId
      };
      await this.redisClient.set(socketKey, JSON.stringify(map));
    } catch (error) {
      throw new Error("Failed to set user data in Redis.");
    }
  }

  // Get a value by key from Redis
  async getUserSocket(userId: string) {
    const socketKey = 'user:socket:map';
    try {
      const userSocketMap = JSON.parse(await this.redisClient.get(socketKey));
      
      // Check if the userId exists in the map and return the corresponding socket value
      return userSocketMap[userId] || null;
    } catch (error) {
      throw new Error("Failed to get user data from Redis.");
    }
  }

  createUserConnectionPoolKey(userInfo) {
    const userMood = userInfo.selectedInterests; // [2, 5]
    const userInterestIds = userInfo.interests.map((item:any) => item.interest.id);
    const key = `Mood:[${userMood.sort().join(',')}]-Interests:[${userInterestIds.sort().join(',')}]`;
    return key
  }

  async findUserConnection(userInfo) {
    const key = this.createUserConnectionPoolKey(userInfo);

    const existing = await this.redisClient.get(this.connectionPoolKey);
    if (!existing) return null;

    const connectionPool = JSON.parse(existing);

    for (const [poolKey, userInfo] of Object.entries(connectionPool)) {
      if (this.isSufficientMatch(key, poolKey)) {
        // Delete matched entry and update Redis
        delete connectionPool[poolKey];
        await this.redisClient.set(this.connectionPoolKey, JSON.stringify(connectionPool));
        return userInfo;
      }
    }

    return null;
  }

  private isSufficientMatch(userKey: string, poolKey: string): boolean {
    const parseKey = (key: string) => {
      const moodMatch = key.match(/Mood:\[(.*?)\]/);
      const interestMatch = key.match(/Interests:\[(.*?)\]/);
  
      const moods = moodMatch?.[1]?.split(',').map(Number) || [];
      const interests = interestMatch?.[1]?.split(',').map(Number) || [];
  
      return { moods, interests };
    };
  
    const user = parseKey(userKey);
    const pool = parseKey(poolKey);
    
    const moodMatch = user.moods.some(m => pool.moods.includes(m));
    const commonInterests = user.interests.filter(i => pool.interests.includes(i));
  
    return moodMatch && commonInterests.length >= 1; // Adjust threshold as needed
  }
  
  

  async saveUserToConnectionPool(userInfo) {
    try {
      const key = this.createUserConnectionPoolKey(userInfo)      
      const existing = await this.redisClient.get(this.connectionPoolKey) 
      const connectionPool = existing ? JSON.parse(existing) : {}
      connectionPool[key] = {
        email:userInfo.email, 
        name: userInfo.fullName
      }
      await this.redisClient.set(this.connectionPoolKey, JSON.stringify(connectionPool))
    } catch (error) {
      throw new Error("Failed to set user in connection pool.");
    }
  }

  async deleteUserFromConnectionPool(userInfo: any) {
    try {
      const key = this.createUserConnectionPoolKey(userInfo)
      const existing = await this.redisClient.get(this.connectionPoolKey) 
      const connectionPool = existing ? JSON.parse(existing) : {}
      delete connectionPool[key];
      await this.redisClient.set(this.connectionPoolKey, JSON.stringify(connectionPool))
    } catch (error) {      
      console.log(error,"======");
      
      throw new Error("Failed to remove user from connection pool.");
    }
  }

  // Delete a key from Redis
  async delUserSocket(userId: string): Promise<void> {
    const socketKey = 'user:socket:map';
    try {
      const userSocketMap = JSON.parse(await this.redisClient.get(socketKey)); // Fetch and parse the existing data
      if (userSocketMap && userSocketMap[userId]) {
        delete userSocketMap[userId]; // Remove the userId from the map
        await this.redisClient.set(socketKey, JSON.stringify(userSocketMap)); // Save the updated map back to Redis
      }
    } catch (error) {
      throw new Error("Failed to delete user socket from Redis.");
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
