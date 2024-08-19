import type { z } from 'zod';
import type { createUserSchema, loginSchema } from './validation';

export enum Roles {
	user = 'user',
	admin = 'admin',
}

export enum Position {
	front_end = 'front-end',
	back_end = 'back-end',
}

export type createUserDTO = z.infer<typeof createUserSchema>;
export type loginDTO = z.infer<typeof loginSchema>;
