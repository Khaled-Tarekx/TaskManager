import 'dotenv/config';
import express from "express";
import  session  from 'express-session';

import ErrorHandler from "./errors/middleware.js";
import UserRouter from "./modules/users/routes.js";
import AuthRouter from "./auth/routes.js"
import TaskRouter from "./modules/tasks/routes.js";
import CommentRouter from "./modules/comments/routes.js";
import ReplyRouter from "./modules/replies/routes.js";
import LikeRouter from "./modules/likes/routes.js";
import passport from './auth/middleware.js';
import connectWithRetry from "./database/connection.js";


const secret: string | undefined = process.env.SECRET_KEY;
const validSecret: string = secret ?? '';

const app = express();
app.use(express.json());

app.use(session({
    secret: validSecret,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
  }))

app.use(passport.initialize());
app.use(passport.session())

const authentication =  passport.authenticate('jwt')
app.use('/', AuthRouter)
app.use('/users', authentication, UserRouter)
app.use('/tasks', authentication, TaskRouter)
app.use('/comments', authentication, CommentRouter)
app.use('/replies', authentication, ReplyRouter)
app.use('/likes', authentication, LikeRouter)
app.use(ErrorHandler);

connectWithRetry()

app.listen(process.env.PORT, () => {
    console.log(`app is listening on port ${process.env.PORT}`);
});

