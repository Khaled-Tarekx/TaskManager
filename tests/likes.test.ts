import request from 'supertest';
import { test } from '../src/utills/test-utils';
import { expect } from 'vitest';
import { app } from './comment.test';

test('should return a response of 200 and an array of loggedin user comment likes', async ({
	user,
}) => {
	const response = await request(app)
		.get(`/api/v1/likes/comments/me/:commentId`)
		.set('Authorization', `Bearer ${user.access_token}`);

	expect(response.statusCode).toBe(200);
	expect(response.body).toBeDefined();
	expect(response.body).toHaveProperty('count');
	expect(response.body).toHaveProperty('data');
	expect(Array.isArray(response.body.data)).toBe(true);
});

test('should return a response of 200 and an array of comment likes', async ({
	user,
}) => {
	const response = await request(app)
		.get(`/api/v1/likes/comments/:commentId`)
		.set('Authorization', `Bearer ${user.access_token}`);

	expect(response.statusCode).toBe(200);
	expect(response.body).toBeDefined();
	expect(response.body).toHaveProperty('count');
	expect(response.body).toHaveProperty('data');
	expect(Array.isArray(response.body.data)).toBe(true);
});
