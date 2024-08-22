import { z } from 'zod';
import { updateUserSchema } from './validations';

export enum Roles {
	user = 'user',
	admin = 'admin',
}

export enum Position {
	front_end = 'Front_End',
	back_end = 'Back-End',
}

export type updateUserDTO = z.infer<typeof updateUserSchema>;
