import { User } from "../entities/User";
import { Arg, Ctx, Field, InputType, Mutation, ObjectType, Query, Resolver } from "type-graphql";
import { MyContext } from "../types";
import argon2 from "argon2"

@InputType()
class  UsernamePasswordInput {
    @Field()
    username: string;
    @Field()
    password: string;
}

@ObjectType()
class FieldError{
    @Field()
    field: string;

    @Field()
    message: string;
}

@ObjectType()
class UserResponse {
    @Field(() => [FieldError], {nullable: true})
    errors?: FieldError[];

    @Field(() => User, {nullable: true})
    user?: User;
}

@Resolver()
export class UserResolver {

    @Query(() => User, {nullable: true})
    async me(
        @Ctx() { req, em }: MyContext
    ){
        if(!req.session.userId){
            return null;
        }

        const user = await em.findOne(User, { id: req.session.userId });
        return user;
    }


    @Mutation(() => UserResponse)
    async register(
        @Arg("options") options: UsernamePasswordInput,
        @Ctx() {em, req}: MyContext
    ){

        if(options.username.length <= 2){
            return {
                errors: [{
                    field: "username",
                    message: "change username"
                }]
            }
        }

        const user = await em.findOne(User, { username: options.username });
        if(user){
            return {
                errors: [{
                    field: "username",
                    message: "already exist"
                }]
            };
        }
        const hashedPassword = await argon2.hash(options.password);

        const new_user = em.create(User, {
            username: options.username, 
            password: hashedPassword
        });


        await em.persistAndFlush(new_user);
        req.session.userId = new_user.id;
        
        return {
            user: new_user
        };
    }

    @Mutation(() => UserResponse)
    async login(
        @Arg("options") options: UsernamePasswordInput,
        @Ctx() {em, req }: MyContext
    ){
        const user = await em.findOne(User, { username: options.username });
        if(!user){
            return {
                errors: [{
                    field: "username",
                    message: "that username doesn't exist"
                }]
            }
        }

        const valid = await argon2.verify(user.password ,options.password);
        if(!valid){

            return {
                errors: [{
                    field: "password",
                    message: "password is incorrect"
                }]
            }
        }

        req.session.userId = user.id;
        // don't understand "!" symbola means;

        return {
            user: user
        };
    }
}