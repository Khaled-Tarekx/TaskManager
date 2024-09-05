import express from 'express';
import {
	login,
	refreshSession,
	refreshToken,
	register,
	registerUser,
	signInUser,
} from './controllers';
import { validateResource } from './utillities';
import { loginSchema, createUserSchema, tokenSchema } from './validation';

const router = express.Router();

// router
// 	.route('/register')
// 	.post(validateResource({ bodySchema: createUserSchema }), register);
// router
// 	.route('/login')
// 	.post(validateResource({ bodySchema: loginSchema }), login);
// router
// 	.route('/refresh-token')
// 	.post(validateResource({ bodySchema: tokenSchema }), refreshToken);

router
	.route('/register-user')
	.post(validateResource({ bodySchema: createUserSchema }), registerUser);
router
	.route('/login-user')
	.post(validateResource({ bodySchema: loginSchema }), signInUser);
router.route('/refresh-session').post(refreshSession);

export default router;
