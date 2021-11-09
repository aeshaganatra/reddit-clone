import { User } from "../entities/User";
import { Arg, Ctx, Field, FieldResolver, InputType, Mutation, ObjectType, Query, Resolver, Root } from "type-graphql";
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

@Resolver(User)
export class UserResolver {

    @FieldResolver()
    email(
        @Root() user: User,
        @Ctx() {req}: MyContext
    ){
        if(req.session.userId === user.id){
            return user.email;
        }
        return "";
    }

    @Mutation(() => UserResponse)
    async changePassword(
        @Arg("token") token: string,
        @Arg("newPassword") newPassword: string,
        @Ctx() {redis, req}: MyContext
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

        const userid = parseInt(userID);
        const user = await User.findOne(userid);

        if(!user){
            return {
                errors: [{
                    field: "token",
                    message: "User Expired" 
                }] 
            };
        }

        await User.update(
            {id: userid}, 
            {password: await argon2.hash(newPassword)}
        );
        
        await redis.del(key);
        req.session.userId = user.id;

        return { user };

    }

    @Mutation(() => Boolean)
    async forgetPassword(
        @Arg("email") email: string,
        @Ctx() {redis}: MyContext
    ){
        const user = await User.findOne({ where: {email} });
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
    me(
        @Ctx() { req }: MyContext
    ){
        if(!req.session.userId){
            return null;
        }
        return User.findOne(req.session.userId);
    }


    @Mutation(() => UserResponse)
    async register(
        @Arg("options") options: UsernamePasswordInput,
        @Ctx() {req}: MyContext
    ){

        if(options.username.length <= 2 || options.username.includes("@")){
            return {
                errors: [{
                    field: "username",
                    message: "change username"
                }]
            }
        }
        const user = await User.findOne({ where: { username: options.username }});
        if(user){
            return {
                errors: [{
                    field: "username",
                    message: "already exist"
                }]
            };
        }
        const hashedPassword = await argon2.hash(options.password);

        const new_user = await User.create({
            username: options.username, 
            password: hashedPassword,
            email: options.email 
        }).save();

        req.session.userId = new_user.id;
        
        return {
            user: new_user
        };
    }

    @Mutation(() => UserResponse)
    async login(
        @Arg("usernameOrEmail") usernameOrEmail: string,
        @Arg("password") password: string,
        @Ctx() { req }: MyContext
    ){
        
        const user = await User.findOne(
            usernameOrEmail.includes("@") ? 
            {where: {email: usernameOrEmail}}: 
            {where: {username: usernameOrEmail}}
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