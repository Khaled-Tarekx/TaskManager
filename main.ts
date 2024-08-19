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

const secret = process.env.SECRET_KEY;

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
app.use(authentication);
app.use('/api/users', UserRouter);
app.use('/api/workSpaces', WorkSpaceRouter);
app.use('/api/workSpaces', MembersRouter);
app.use('/api/tasks', TaskRouter);
app.use('/api/comments', CommentRouter);
app.use('/api/replies', ReplyRouter);
app.use('/api/likes', LikeRouter);
app.use(ErrorHandler);

connectWithRetry().then(() => {
	console.log('reached main file');
});

const port = process.env.PORT;

app.listen(port, () => {
	console.log(`app is listening on port ${port}`);
});
