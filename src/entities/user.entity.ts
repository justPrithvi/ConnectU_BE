import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, OneToMany, ManyToOne } from 'typeorm';
import { UserPhotos } from './userPhotos.entity';
import { UserInterests } from './userIntrests.entity';
import { Gender } from './gender.entity';
// import { Gender } from './gender.entity';
// import { UserPhotos } from './userPhotos.entity';
// import { UserInterests } from './userIntrests.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  username: string;

  @Column({ type: 'varchar', length: 100 })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;  // Make sure to hash the password before saving it to the DB

  @Column({ type: 'varchar', length: 10})
  phoneNumber: Number

  @Column({ type: 'varchar', length: 10})
  age: Number

  @ManyToOne(() => Gender, { eager: false })
  @JoinColumn({ name: 'gender' }) // explicitly name it genderId to match what TypeORM expects
  gender: Gender;
  
  @Column({ type: 'varchar', length: 10})
  bio: string

  @Column({ type: 'varchar', length:10})
  location: string

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // ✅ Add OneToMany for photos
  @OneToMany(() => UserPhotos, (photo) => photo.user)
  photos: UserPhotos[];

  // ✅ Add OneToMany for interests
  @OneToMany(() => UserInterests, (interest) => interest.user)
  interests: UserInterests[];
}
