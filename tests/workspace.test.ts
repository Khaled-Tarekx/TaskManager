import request from 'supertest';
import { test } from '../src/utills/test-utils';
import { expect } from 'vitest';
import { app } from './comment.test';

test('should return a response of 200 and members of workspace', async ({
	user,
}) => {
	const response = await request(app)
		.get(`api/v1/workspaces/members/:workspaceId`)
		.set('Authorization', `Bearer ${user.access_token}`);

	expect(response.statusCode).toBe(200);
	expect(response.body).toBeDefined();
	expect(response.body).toHaveProperty('count');
	expect(response.body).toHaveProperty('data');
	expect(Array.isArray(response.body.data)).toBe(true);
});

test('should return a response of 200 and an array of workspaces', async ({
	user,
}) => {
	const response = await request(app)
		.get(`api/v1/workspaces/`)
		.set('Authorization', `Bearer ${user.access_token}`);

	expect(response.statusCode).toBe(200);
	expect(response.body).toBeDefined();
	expect(response.body).toHaveProperty('count');
	expect(response.body).toHaveProperty('data');
	expect(Array.isArray(response.body.data)).toBe(true);
});

test('should return a response of 200 and the requested workspace', async ({
	user,
}) => {
	const response = await request(app)
		.get(`/api/v1/workspaces/66edfd2ef52280cc38bb7277`)
		.set('Authorization', `Bearer ${user.access_token}`);

	expect(response.statusCode).toBe(200);
	expect(response.body).toBeDefined();
	expect(response.body).toHaveProperty('data');
});
