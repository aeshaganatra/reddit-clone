import { Post } from "../entities/Post";
import { Arg, Ctx, Field, InputType, Mutation, Query, Resolver, UseMiddleware } from "type-graphql";
import { MyContext } from "src/types";
import { isAuth } from "../middleware/isAuth";

@InputType()
class PostInput{
    @Field()
    title: string
    @Field()
    text: string
}

@Resolver()
export class PostResolver {
    @Query(() => [Post])
    posts(){
        return Post.find();
    }
    
    @Query(() => Post, {nullable: true})
    post(
        @Arg("id") id: number,
    ){
        return Post.findOne(id);
    }

    @Mutation(() => Post, {nullable: true})
    @UseMiddleware(isAuth)
    createPost(
        @Arg("input") input: PostInput,
        @Ctx() { req }: MyContext
    ){
        return Post.create({
            ...input,
            creatorId: req.session.userId
        }).save();
    }

    @Mutation(() => Post)
    async updatePost(
        @Arg("id") id: number,
        @Arg("title", () => String, {nullable: true}) title: string,
    ){
        const post = await Post.findOne(id);
        
        if(!post){
            return null;
        }
        if(typeof title !== "undefined"){
            post.title = title;
            await Post.update({id}, {title});
        }
        return post;
    }
   
    @Mutation(() => Boolean)
    async deletePost(
        @Arg("id") id: number,
    ){
        await Post.delete(id);
        return true;
    }
}