import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, OneToMany, ManyToOne } from 'typeorm';
import { UserPhotos } from './userPhotos.entity';
import { UserInterests } from './userIntrests.entity';
import { Gender } from './gender.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  fullName: string;

  @Column({ type: 'varchar', length: 100 })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  password: string; // Hash the password before saving

  @Column({ type: 'varchar', length: 10, nullable: true })
  phoneNumber: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  age: string;

  @ManyToOne(() => Gender, { eager: false, nullable: true })
  @JoinColumn({ name: 'gender' })
  gender: Gender;

  @Column({ type: 'varchar', length: 255, nullable: true })
  bio: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  location: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => UserPhotos, (photo) => photo.user)
  photos: UserPhotos[];

  @OneToMany(() => UserInterests, (interest) => interest.user)
  interests: UserInterests[];
}
