import { mongooseId } from '../../utills/helpers';
import z from 'zod';
import { Status } from './types';

export const createTaskSchema = z.object({
	priority: z.number().max(10),
	assigneesId: z.array(mongooseId),
	workspaceId: mongooseId,
	tags: z.array(z.string()),
	deadline: z.string(z.date()),
	parentTask: mongooseId.optional(),
	subtasks: z.array(mongooseId).optional(),
	status: z.nativeEnum(Status).default(Status.Unassigned),
	customFields: z.map(z.string(), z.string()),
});

export const updateTaskSchema = z.object({
	priority: z.number().max(10),
	tags: z.array(z.string()),
	deadline: z.string(z.date()),
	status: z.nativeEnum(Status).default(Status.Unassigned).optional(),
	subtasks: z.array(mongooseId).optional(),
	customFields: z.map(z.string(), z.string()),
	assignees: z.array(mongooseId).optional(),
});

export const assignTaskSchema = z.object({
	assigneesId: z.array(mongooseId),
});
