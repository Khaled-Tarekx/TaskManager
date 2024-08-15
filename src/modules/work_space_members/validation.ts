import { validateMongooseId } from 'src/setup/helpers.js';
import z from 'zod';

const roleEnum = ['member', 'owner'] as const;

export const workSpaceMembersSchema = z.object({
	workspace: validateMongooseId,
	user: validateMongooseId,
	role: z.enum(roleEnum).default(roleEnum[0]),
});

export const updateWorkSpaceMembersSchema = z.object({
	role: z.enum(roleEnum),
});

export type workSpaceDTO = z.infer<typeof workSpaceMembersSchema>;
export type updateWorkSpaceDTO = z.infer<typeof updateWorkSpaceMembersSchema>;
