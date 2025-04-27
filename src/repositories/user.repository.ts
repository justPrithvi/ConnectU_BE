import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { UserInterests } from 'src/entities/userIntrests.entity';
import { Interest } from 'src/entities/intrests.entity';
import { UserPhotos } from 'src/entities/userPhotos.entity';

@Injectable()
export class UserRepository {
  private readonly repository: Repository<User>;

  constructor(private readonly dataSource: DataSource) {
    // Initialize repository from DataSource
    this.repository = dataSource.getRepository(User);
  }

  // Example of custom method
  async findByEmail(email: string): Promise<User | undefined> {
    return this.repository.findOne({ 
      where: { email },
      relations: ['photos', 'interests', 'gender']
    });
  }

  // Example of creating a new user
  async createUser(fullName: string, email: string, password: string): Promise<User> {
    const user = this.repository.create({ fullName:fullName, email, password });
    return this.repository.save(user);
  }

  async saveUser(body: any) {
    const existingUser = await this.repository.findOne({ where: { email: body.email } });
    if (!existingUser) {
      throw new Error('User not found');
    }
    existingUser.age = body.age;
    existingUser.gender = body.gender;
    existingUser.bio = body.bio;
    existingUser.phoneNumber = body.phoneNumber || 9667352982
  
    const updatedUser = await this.repository.save(existingUser);
  
    // Save profile URL in UserPhotos table if it exists
    if (body.profileUrl) {
      const userPhoto = new UserPhotos();
      userPhoto.url = body.profileUrl; // Assuming body.profile contains the S3 URL
      userPhoto.user = updatedUser; // Link to the existing user
      userPhoto.isPrimary = true; // Mark this photo as primary
      await this.dataSource.getRepository(UserPhotos).save(userPhoto); // Save to UserPhotos table
    }
  
    // Manage user interests
    const interestRepo = this.dataSource.getRepository(UserInterests);
    await interestRepo.delete({ user: updatedUser }); // clear old interests
    
    const interestEntities = body.inetrests.map((interestId: number) => {
      const userInterest = new UserInterests();
      userInterest.user = updatedUser;
      userInterest.interest = { id: interestId } as Interest;
      return userInterest;
    });
    return await interestRepo.save(interestEntities);
  }
  
}
