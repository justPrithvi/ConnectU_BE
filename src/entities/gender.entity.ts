import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

@Entity()
export class Gender {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ type: 'varchar', length: 10})
    name: string
}