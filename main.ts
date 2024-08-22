import 'reflect-metadata';
import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import ErrorHandler from './src/errors/middleware';
import UserRouter from './src/modules/users/routes';
import AuthRouter from './src/modules/auth/routes';
import TaskRouter from './src/modules/tasks/routes';
import CommentRouter from './src/modules/comments/routes';
import ReplyRouter from './src/modules/replies/routes';
import LikeRouter from './src/modules/likes/routes';
import WorkSpaceRouter from './src/modules/work_spaces/routes';
import MembersRouter from './src/modules/work_space_members/routes';
import swaggerUi from 'swagger-ui-express';

import passport from './src/modules/auth/middleware';
import connectWithRetry from './src/database/connection';
import cors from 'cors';
import Redis from 'redis';
import { getTasksPage } from './src/modules/tasks/controllers';
import swaggerSpec from './src/setup/swagger';

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
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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
	console.log('Swagger UI is available on http://localhost:7500/api-docs');
});
