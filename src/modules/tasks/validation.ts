import { mongooseId } from '../../utills/helpers';
import z from 'zod';
import { Status } from './types';
export const createTaskSchema = z.object({
	priority: z.number().max(10),
	assigneeId: mongooseId,
	workspaceId: mongooseId,
	skill_set: z.array(z.string()),
	dead_line: z.string(z.date()),
	dependants: z.array(mongooseId).optional(),
	status: z.nativeEnum(Status).default(Status.Unassigned),
});

export const updateTaskSchema = z.object({
	priority: z.number().max(10),
	skill_set: z.array(z.string()),
	dead_line: z.string(z.date()),
	status: z.nativeEnum(Status).default(Status.Unassigned).optional(),
	dependants: z.array(mongooseId).optional(),
});
