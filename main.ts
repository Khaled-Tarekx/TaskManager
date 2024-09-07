import 'dotenv/config';
import express from 'express';

import connectWithRetry from './src/database/connection';
import Redis from 'redis';

import bootstrap from './src/setup/bootstrap';
export const client = Redis.createClient();

client.on('error', (err) => console.log('Redis Client Error', err));
// await client.connect();
const app = express();
// app.get('/khaled', (req, res) => {
// 	const query = q.parseQuery(req.query);
// 	console.log(query);
// });

bootstrap(app);

connectWithRetry().then(() => {
	console.log('reached main file');
});

const port = process.env.PORT;

app.listen(port, () => {
	console.log(`app is listening on port ${port}`);
	console.log('Swagger UI is available on http://localhost:7500/api-docs');
});
