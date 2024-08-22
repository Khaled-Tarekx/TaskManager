import { z } from 'zod';
import { updateUserSchema } from './validations';

export type updateUserDTO = z.infer<typeof updateUserSchema>;
