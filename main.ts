import 'dotenv/config';
import express from "express";
import  session  from 'express-session';
import ErrorHandler from "./errors/middleware.js";
import UserRouter from "./src/modules/users/routes.js";
import AuthRouter from "./src/modules/auth/routes.js"
import TaskRouter from "./src/modules/tasks/routes.js";
import CommentRouter from "./src/modules/comments/routes.js";
import ReplyRouter from "./src/modules/replies/routes.js";
import LikeRouter from "./src/modules/likes/routes.js";
import WorkSpaceRouter from "./src/modules/work_spaces/routes.js";
import MembersRouter from "./src/modules/work_space_members/routes.js";

import passport from './src/modules/auth/middleware.js';
import connectWithRetry from "./database/connection.js";
import cors from "cors";
import Redis from "redis";
import { getTasksPage } from "./src/modules/tasks/controllers.js";
const secret: string | undefined = process.env.SECRET_KEY;
const validSecret: string = secret ?? '';

export const client = Redis.createClient()

client.on('error', err => console.log('Redis Client Error', err));

await client.connect();

const app = express();
app.use(express.json());
app.use(cors())
app.use(session({
    secret: validSecret,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
  }))

app.use(passport.initialize());
app.use(passport.session())
app.get('/tasks', getTasksPage)
app.set('view engine', 'ejs');
const authentication =  passport.authenticate('jwt')
app.use('/uploads', express.static('uploads'))
app.use('/', AuthRouter)
app.use('/api/users', authentication, UserRouter)
app.use('/api/workSpaces', authentication, WorkSpaceRouter)
app.use('/api/workSpaces', authentication, MembersRouter)
app.use('/api/tasks',  authentication, TaskRouter)
app.use('/api/comments', authentication, CommentRouter)
app.use('/api/replies', authentication, ReplyRouter)
app.use('/api/likes', authentication, LikeRouter)
app.use(ErrorHandler);

connectWithRetry().then( () => {
    console.log('reached main file')
})


app.listen(process.env.PORT, () => {
    console.log(`app is listening on port ${process.env.PORT}`);
});
