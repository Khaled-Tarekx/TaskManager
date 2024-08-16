import { mongooseId } from 'src/setup/helpers.js';
import z from 'zod';

const status = ['unAssigned', 'inProgress', 'completed'] as const;

export const taskSchema = z.object({
	priority: z.number().max(10),
	owner: mongooseId,
	skill_set: z.array(z.string()),
	attachment: z.string(),
	dead_line: z.date(),
	dependants: z.array(mongooseId),
	status: z.enum(status).default('unAssigned'),
});

export const updateTaskSchema = z.object({
	priority: z.number().max(10),
	skill_set: z.array(z.string()),
	attachment: z.string(),
	dead_line: z.date(),
	status: z.enum(status).default('unAssigned'),
});
