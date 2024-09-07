import {z} from 'zod';
import {updateUserSchema} from './validations';
import 'express';
import {InferRawDocType, Types} from 'mongoose';
import {UserSchema} from './models';

export type updateUserDTO = z.infer<typeof updateUserSchema>;

declare global {
    namespace Express {
        interface User extends InferRawDocType<UserSchema> {
            id: string
            _id: string | Types.ObjectId;
            supaId?: string;
        }
    }
}
