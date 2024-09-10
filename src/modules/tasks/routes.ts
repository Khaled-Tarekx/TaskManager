import { Router } from 'express';
import {
	getTask,
	getTasks,
	createTask,
	updateTask,
	deleteTask,
	assignTask,
	markCompleted,
} from './controllers';
import uploads from '../../setup/upload';
import { validateResource } from '../../utills/middlewares';
import { createTaskSchema, updateTaskSchema } from './validation';

const router = Router();
router
	.route('/')
	.get(getTasks)
	.post(
		validateResource({ bodySchema: createTaskSchema }),
		uploads.single('attachment'),
		createTask
	);

router.patch('/:taskId/assign/:assigneeId', assignTask);
router.patch('/:taskId/completed', markCompleted);

router
	.route('/:taskId')
	.get(getTask)
	.patch(
		validateResource({ bodySchema: updateTaskSchema }),
		uploads.single('attachment'),
		updateTask
	)
	.delete(deleteTask);

export default router;
