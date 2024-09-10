import { z } from 'zod';
import {
	assignTaskSchema,
	createTaskSchema,
	updateTaskSchema,
} from './validation';

export enum Status {
	Unassigned = 'unassigned',
	InProgress = 'inprogress',
	Completed = 'completed',
}

export type assignTaskDTO = z.infer<typeof assignTaskSchema>;
export type createTaskDTO = z.infer<typeof createTaskSchema>;
export type updateTaskDTO = z.infer<typeof updateTaskSchema>;
