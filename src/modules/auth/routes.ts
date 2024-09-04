import express from 'express';
import { login, refreshToken, register } from './controllers';
import { validateResource } from './utillities';
import { loginSchema, createUserSchema, tokenSchema } from './validation';

const router = express.Router();

router
	.route('/register')
	.post(validateResource({ bodySchema: createUserSchema }), register);
router
	.route('/login')
	.post(validateResource({ bodySchema: loginSchema }), login);
router
	.route('/refresh-token')
	.post(validateResource({ bodySchema: tokenSchema }), refreshToken);

export default router;
