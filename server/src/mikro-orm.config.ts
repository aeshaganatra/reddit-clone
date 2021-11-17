import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import { MikroORM } from "@mikro-orm/core";
import path from "path";
import { User } from "./entities/User";

export default {

    migrations: {
        path: path.join(__dirname, "./migrations"),
        pattern: /^[\w-]+\d+\.[tj]s$/,
    },
    entities: [Post, User],
    type: "mysql",
    dbName: "lireddit",
    user: "root",
    debug: !__prod__,
    password: "admin"
} as Parameters <typeof MikroORM.init> [0];
