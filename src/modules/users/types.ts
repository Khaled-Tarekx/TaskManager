import { z } from 'zod';
import { updateUserSchema } from './validations';
import 'express';
import { InferRawDocType } from 'mongoose';
import { UserSchema } from './models';

export type updateUserDTO = z.infer<typeof updateUserSchema>;

declare global {
	namespace Express {
		interface User extends InferRawDocType<UserSchema> {
			id: string;
		}
	}
}
