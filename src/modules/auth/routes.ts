import express from 'express';
import {
	refreshSession,
	registerUser,
	resetPassword,
	signInUser,
} from './controllers';
import { validateResource } from '../../utills/middlewares';
import {
	loginSchema,
	createUserSchema,
	resetPasswordSchema,
	refreshTokenSchema,
} from './validation';

const router = express.Router();

router.post(
	'/register-user',
	validateResource({ bodySchema: createUserSchema }),
	registerUser
);
router.post(
	'/login-user',
	validateResource({ bodySchema: loginSchema }),
	signInUser
);
router.post(
	'/refresh-session',
	validateResource({ bodySchema: refreshTokenSchema }),
	refreshSession
);
router.patch(
	'/reset-password',
	validateResource({ bodySchema: resetPasswordSchema }),
	resetPassword
);

export default router;
