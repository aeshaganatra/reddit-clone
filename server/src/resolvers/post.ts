import { Post } from "../entities/Post";
import { Arg, Mutation, Query, Resolver } from "type-graphql";

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

    @Mutation(() => Post)
    createPost(
        @Arg("title") title: string,
    ){
        return Post.create({title}).save();
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