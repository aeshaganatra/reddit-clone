import { Post } from "../entities/Post";
import { Arg, Ctx, Field, FieldResolver, InputType, Int, Mutation, ObjectType, Query, Resolver, Root, UseMiddleware } from "type-graphql";
import { MyContext } from "src/types";
import { isAuth } from "../middleware/isAuth";
import { getConnection} from "typeorm";
import { Updoot } from "../entities/Updoot";

@InputType()
class PostInput{
    @Field()
    title: string
    @Field()
    text: string
}

@ObjectType()
class PostType{
    @Field()
    creatorName: string

    @Field()
    creatorId: string

    @Field()
    id: number

    @Field()
    points: number
    
    @Field()
    textSnippet: string

    @Field()
    title: string

    @Field()
    createdAt: string

}

@ObjectType()
class PaginatedPosts{
    @Field(() => [PostType])
    posts: PostType[]
    @Field()
    hasMore: boolean
}

@Resolver(Post)
export class PostResolver {

    @FieldResolver(() => String)
    textSnippet(
        @Root() root: Post
    ){
        return root.text.slice(0, 50);
    }

    @Mutation(() => Boolean)
    @UseMiddleware(isAuth)
    async vote(
        @Arg("postId", () => Int) postId: number,
        @Arg("value", () => Int) value: number,
        @Ctx() {req}: MyContext
    ){
        const isUpdoot = value !== -1;
        const realValue = isUpdoot ? 1 : -1;   
        const  userId  = req.session.userId;

        await Updoot.insert({
            userId: userId,
            postId: postId,
            value: realValue 
        });
        await getConnection().query(`
            update post
            set points = points  + ${realValue}     
            where id = ${postId};
        `);
        
        return true;
    }

    @Query(() => PaginatedPosts)
    async posts(
        @Arg("limit", () => Int) limit: number,
        @Arg("cursor", () => String, {nullable: true}) cursor: string | null
    ){
        const realLimit = Math.min(50, limit);
        const realLImitPlusOne = realLimit + 1;
        // let cursorDate = "";
        // if(cursor){
        //     cursorDate = JSON.stringify(new Date(parseInt(cursor)));
        //     console.log(cursorDate);
        // }
        // const posts = await getConnection().query(
        // `
        // select p.* 
        // from post p
        // inner join user u on u.id = p.creatorId
        // ${cursor ? `where p.createdAt < ${cursorDate}`: ""}
        // order by p.createdAt DESC
        // limit ${realLImitPlusOne}
        // `);

        const qb = getConnection()
            .getRepository(Post)
            .createQueryBuilder("p")
            .innerJoinAndSelect(
                "p.creator",
                "u",
                "u.id = p.creatorId", 
            )
            .orderBy("p.createdAt", "DESC")
            .take(realLImitPlusOne);
        if(cursor){
            const cursorDate = new Date(parseInt(cursor));
            console.log(cursorDate);
            qb.where("p.createdAt < :cursor", { cursor: cursorDate})
        }
        // i was fucked up to return data and only change was at Post.ts 
        const posts = await qb.getMany();            

        let output:any = [];
        posts.forEach(p => {
            output.push({
                creatorName: p.creator.username,
                creatorId: p.creator.id,
                id: p.id,
                textSnippet: p.text.slice(0, 50),
                title: p.title,
                points: p.points,
                createdAt: p.createdAt
            })
        });
        return { 
            posts: output, 
            hasMore: posts.length === realLImitPlusOne
        }
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