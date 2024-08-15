import { validateMongooseId } from 'src/setup/helpers.js';
import z from 'zod';

const status = ['unAssigned', 'inProgress', 'completed'] as const;
export const taskSchema = z.object({
	priority: z.number().max(10),
	owner: validateMongooseId,
	skill_set: z.array(z.string()),
	attachment: z.string(),
	dead_line: z.date(),
	dependants: z.array(validateMongooseId),
	status: z.enum(status).default('unAssigned'),
});
export const updateTaskSchema = z.object({
	priority: z.number().max(10),
	skill_set: z.array(z.string()),
	attachment: z.string(),
	dead_line: z.date(),
	status: z.enum(status).default('unAssigned'),
});
export type taskDTO = z.infer<typeof taskSchema>;
export type updateTaskDTO = z.infer<typeof updateTaskSchema>;
