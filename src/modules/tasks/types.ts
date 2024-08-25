import { z } from 'zod';
import { createTaskSchema, updateTaskSchema } from './validation';

export enum Status {
	Unassigned = 'unassigned',
	InProgress = 'inprogress',
	Completed = 'completed',
}
export type assignTaskParams = { taskId: string; assigneeId: string };

export type createTaskDTO = z.infer<typeof createTaskSchema>;
export type updateTaskDTO = z.infer<typeof updateTaskSchema>;
