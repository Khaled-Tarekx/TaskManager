import type { z } from 'zod';
import type {
	createUserSchema,
	loginSchema,
	tokenSchema,
} from './validation';
import { JwtPayload } from 'jsonwebtoken';

export enum Roles {
	user = 'user',
	admin = 'admin',
}

export enum Position {
	front_end = 'Front-End',
	back_end = 'Back-End',
}
export interface CustomJwtPayload extends JwtPayload {
	id: string;
}
export type createUserDTO = z.infer<typeof createUserSchema>;
export type loginDTO = z.infer<typeof loginSchema>;
