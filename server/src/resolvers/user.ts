import { User } from "../entities/User";
import { Arg, Ctx, Field, InputType, Mutation, ObjectType, Query, Resolver } from "type-graphql";
import { MyContext } from "../types";
import argon2 from "argon2"
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from "../constants";
import { sendEmail } from "../utils/sendEmail";
import {v4} from "uuid"

@InputType()
class  UsernamePasswordInput {
    @Field()
    username: string;
    @Field()
    password: string;
    @Field()
    email: string;
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

    @Mutation(() => UserResponse)
    async changePassword(
        @Arg("token") token: string,
        @Arg("newPassword") newPassword: string,
        @Ctx() {redis, em, req}: MyContext
    ){
        const key = FORGET_PASSWORD_PREFIX + token;
        const userID = await redis.get(key);
        if(newPassword.length <= 2){
            return { errors: [{
                    field: "newPassword",
                    message: "change password" 
                }] 
            };
        }

        if(!userID){
            return { errors: [{
                    field: "token",
                    message: "token expired" 
                }] 
            };
        }

        const user = await em.findOne(User, {id: parseInt(userID)});

        if(!user){
            return {
                errors: [{
                    field: "token",
                    message: "User Expired" 
                }] 
            };
        }

        user.password = await argon2.hash(newPassword); 
        await em.persistAndFlush(user);
        
        await redis.del(key);
        req.session.userId = user.id;

        return { user };

    }

    @Mutation(() => Boolean)
    async forgetPassword(
        @Arg("email") email: string,
        @Ctx() {em, redis}: MyContext
    ){
        const user = await em.findOne(User, { email });
        if(!user){
            return true;
        }
        const token = v4();
        redis.set(FORGET_PASSWORD_PREFIX + token, user.id, 'ex', 1000 * 60 * 60);
        await sendEmail(email,
            `<a href="http://localhost:3000/change-password/${token}"> reset passwoed </a>`
            );
        return true;
    }

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

        if(options.username.length <= 2 || options.username.includes("@")){
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
            password: hashedPassword,
            email: options.email 
        });


        await em.persistAndFlush(new_user);
        req.session.userId = new_user.id;
        
        return {
            user: new_user
        };
    }

    @Mutation(() => UserResponse)
    async login(
        @Arg("usernameOrEmail") usernameOrEmail: string,
        @Arg("password") password: string,
        @Ctx() {em, req }: MyContext
    ){
        
        const user = await em.findOne(User, 
            usernameOrEmail.includes("@") ? 
            {email: usernameOrEmail}: 
            {username: usernameOrEmail}
        );

        if(!user){
            return {
                errors: [{
                    field: "usernameOrEmail",
                    message: "that username or email doesn't exist"
                }]
            }
        }

        const valid = await argon2.verify(user.password ,password);
        if(!valid){

            return {
                errors: [{
                    field: "password",
                    message: "password is incorrect"
                }]
            }
        }

        req.session.userId = user.id;

        return {
            user: user
        };
    }

    @Mutation(() => Boolean)
    logout(
        @Ctx() {req, res}: MyContext
    ){
        return new Promise((resolve) => req.session.destroy(err => {
            if(err){
                console.log(err);
                resolve(false);
                return;
            }
            res.clearCookie(COOKIE_NAME);
            resolve(true);
        }));
    }

}