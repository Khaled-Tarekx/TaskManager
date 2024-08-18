import { mongooseId } from 'src/setup/helpers.js';
import z from 'zod';
import { Role } from './types.js';

export const createMemberSchema = z.object({
	workspace: mongooseId,
	member: mongooseId,
	role: z.nativeEnum(Role).default(Role.member),
});
export const validateMemberParams = z.object({
	workspaceId: mongooseId,
	memberId: mongooseId,
});

export const updateMemberSchema = z.object({
	role: z.nativeEnum(Role),
});
