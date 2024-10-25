import request from 'supertest';
import { app } from './comment.test';

import { test } from '../src/utills/test-utils';
import { expect } from 'vitest';

test('should return a response of 200 and an array of users', async ({
	user,
}) => {
	const response = await request(app)
		.get(`/api/v1/users/`)
		.set('Authorization', `Bearer ${user.access_token}`);

	expect(response.statusCode).toBe(200);
	expect(response.body).toBeDefined();
	expect(response.body).toHaveProperty('count');
	expect(response.body).toHaveProperty('data');
	expect(Array.isArray(response.body.data)).toBe(true);
});

test('should return a response of 200 and the requested user', async ({
	user,
}) => {
	const response = await request(app)
		.get(`/api/v1/user/:id`)
		.set('Authorization', `Bearer ${user.access_token}`);

	expect(response.statusCode).toBe(200);
	expect(response.body).toBeDefined();
	expect(response.body).toHaveProperty('data');
});
