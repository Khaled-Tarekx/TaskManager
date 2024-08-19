import { z } from 'zod';
import { createTaskSchema, updateTaskSchema } from './validation.js';

export enum Status {
	Unassigned = 'unassigned',
	InProgress = 'in_progress',
	Completed = 'completed',
}
export type assignTaskParams = { taskId: string; workerId: string };

export type createTaskDTO = z.infer<typeof createTaskSchema>;
export type updateTaskDTO = z.infer<typeof updateTaskSchema>;
