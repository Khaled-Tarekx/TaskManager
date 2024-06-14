import 'dotenv/config';
import express from "express";
import  session  from 'express-session';

import ErrorHandler from "./errors/middleware.js";
import UserRouter from "./user/routes.js";
import AuthRouter from "./user/auth/routes.js"
import TaskRouter from "./task/routes.js";
import passport from './user/auth/middleware.js';

import CommentRouter from "./comment/routes.js";
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
app.use(ErrorHandler);

connectWithRetry()

app.listen(process.env.PORT, () => {
    console.log(`app is listening on port ${process.env.PORT}`);
});

