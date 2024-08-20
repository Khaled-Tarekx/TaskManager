import express from 'express';
import { login, register } from './controllers.js';
import { validateResource } from './utillities.js';
import { loginSchema, createUserSchema } from './validation.js';

const router = express.Router();

router
	.route('/register')
	.post(validateResource({ bodySchema: createUserSchema }), register);
router
	.route('/login')
	.post(validateResource({ bodySchema: loginSchema }), login);

export default router;
