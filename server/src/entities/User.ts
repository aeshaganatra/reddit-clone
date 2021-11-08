import { Field, ObjectType } from "type-graphql";
import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@ObjectType()
@Entity()
export class User extends BaseEntity{

  @Field()
  @PrimaryGeneratedColumn() 
  id!: number;

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;

  @Field()
  @Column({type: "text"})
  username!: string;

  @Field()
  @Column({type: "text"})
  email!: string;

  @Column({type: "text"}) 
  password!: string;
}