import z from 'zod';
import { Type } from './types';

export const createWorkSpaceSchema = z.object({
	name: z.string(),
	description: z.string(),
	type: z.nativeEnum(Type).default(Type.other),
});

export const updateWorkSpaceSchema = createWorkSpaceSchema;
