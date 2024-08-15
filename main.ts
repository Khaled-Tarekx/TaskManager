import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import ErrorHandler from './errors/middleware.js';
import UserRouter from './src/modules/users/routes.js';
import AuthRouter from './src/modules/auth/routes.js';
import TaskRouter from './src/modules/tasks/routes.js';
import CommentRouter from './src/modules/comments/routes.js';
import ReplyRouter from './src/modules/replies/routes.js';
import LikeRouter from './src/modules/likes/routes.js';
import WorkSpaceRouter from './src/modules/work_spaces/routes.js';
import MembersRouter from './src/modules/work_space_members/routes.js';

import passport from './src/modules/auth/middleware.js';
import connectWithRetry from './database/connection.js';
import cors from 'cors';
import Redis from 'redis';
import { getTasksPage } from './src/modules/tasks/controllers.js';
import CustomError from 'custom-errors/custom-error.js';
const secret: string | undefined = process.env.SECRET_KEY;
if (!secret) {
	throw new CustomError('secret isnt provided', 404);
}

export const client = Redis.createClient();

client.on('error', (err) => console.log('Redis Client Error', err));

// await client.connect();

const app = express();
const authentication = passport.authenticate('jwt');

app.use(express.json());
app.use(cors());
app.use(
	session({
		secret: secret,
		resave: false,
		saveUninitialized: true,
		cookie: { secure: false },
	})
);

app.use('/', AuthRouter);

app.use(passport.initialize());
app.use(passport.session());
app.get('/tasks', getTasksPage);
app.set('view engine', 'ejs');

app.use('/uploads', express.static('uploads'));
app.use('/api/users', authentication, UserRouter);
app.use('/api/workSpaces', authentication, WorkSpaceRouter);
app.use('/api/workSpaces', authentication, MembersRouter);
app.use('/api/tasks', authentication, TaskRouter);
app.use('/api/comments', authentication, CommentRouter);
app.use('/api/replies', authentication, ReplyRouter);
app.use('/api/likes', authentication, LikeRouter);
app.use(ErrorHandler);

connectWithRetry().then(() => {
	console.log('reached main file');
});

const port: string | undefined = process.env.PORT;

if (!port) {
	throw new CustomError('port isnt provided', 404);
}
app.listen(port, () => {
	console.log(`app is listening on port ${port}`);
});
