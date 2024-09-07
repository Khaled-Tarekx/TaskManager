import {z} from 'zod';

export const updateUserSchema = z.object({
    username: z.string().optional(),
    email: z.string().email({message: 'email is not correct'}).optional(),
});
