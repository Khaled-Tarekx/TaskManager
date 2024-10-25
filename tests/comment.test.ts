import request from 'supertest';
import { beforeAll, expect } from 'vitest';
import { test } from '../src/utills/test-utils';
import { createApp } from 'main';
import { Express } from 'express';

let app: Express;

beforeAll(async () => {
	app = createApp();
});

test('should return a response of 200 and an array of comments', async ({
	user,
}) => {
	const response = await request(app)
		.get(`/api/v1/comments/`)
		.query({ taskId: '66cb5b302ef69c77ef6e61c5' })
		.set('Authorization', `Bearer ${user.access_token}`);

	expect(response.statusCode).toBe(200);
	expect(response.body).toBeDefined();
	expect(response.body).toHaveProperty('count');
	expect(response.body).toHaveProperty('data');
	expect(Array.isArray(response.body.data)).toBe(true);
});

test('should return a response of 200 and the requested comment', async ({
	user,
}) => {
	const response = await request(app)
		.get(`/api/v1/comments/66edfd2ef52280cc38bb7277`)
		.set('Authorization', `Bearer ${user.access_token}`);

	expect(response.statusCode).toBe(200);
	expect(response.body).toBeDefined();
	expect(response.body).toHaveProperty('data');
});

export { app };
