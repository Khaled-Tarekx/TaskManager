import request from 'supertest';
import { test } from '../src/utills/test-utils';
import { expect } from 'vitest';
import { app } from './comment.test';

test('should return a response of 200 and the requested member', async ({
	user,
}) => {
	const response = await request(app)
		.get(`/api/v1/workspaces/search/member`)
		.query('khaled tarek')
		.set('Authorization', `Bearer ${user.access_token}`);

	expect(response.statusCode).toBe(200);
	expect(response.body).toBeDefined();
	expect(response.body).toHaveProperty('data');
});
