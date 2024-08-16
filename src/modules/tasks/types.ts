import { z } from 'zod';
import { taskSchema, updateTaskSchema } from './validation.js';

export enum Status {
	Unassigned = 'unassigned',
	InProgress = 'in_progress',
	Completed = 'completed',
}

// const StatusMap = {
// 	Unassigned: 'unassigned',
// 	InProgress: 'in_progress',
// 	Completed: 'completed',
// } as const;

// type StatusType = typeof StatusMap;
// type Status = StatusType[keyof StatusType];

export type taskDTO = z.infer<typeof taskSchema>;
export type updateTaskDTO = z.infer<typeof updateTaskSchema>;
