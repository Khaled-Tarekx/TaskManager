import type { z } from 'zod';
import type {
	changePasswordSchema,
	createUserSchema,
	loginSchema,
	refreshTokenSchema,
	resetPasswordSchema,
} from './validation';

export enum Roles {
	user = 'user',
	admin = 'admin',
}

export enum Position {
	front_end = 'Front-End',
	back_end = 'Back-End',
}

export type changePasswordDTO = z.infer<typeof changePasswordSchema>;
export type resetpasswordDTO = z.infer<typeof resetPasswordSchema>;
export type refreshSessionDTO = z.infer<typeof refreshTokenSchema>;
export type createUserDTO = z.infer<typeof createUserSchema>;
export type loginDTO = z.infer<typeof loginSchema>;
