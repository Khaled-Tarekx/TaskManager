import express from 'express';
import { login, register } from './controllers';
import { validateResource } from './utillities';
import { loginSchema, createUserSchema } from './validation';

const router = express.Router();

router
	.route('/register')
	.post(validateResource({ bodySchema: createUserSchema }), register);
router
	.route('/login')
	.post(validateResource({ bodySchema: loginSchema }), login);

export default router;
