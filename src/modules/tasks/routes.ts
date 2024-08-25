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
import { validateResource } from '../auth/utillities';
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

router.route('/:taskId/owner/:assigneeId').post(assignTask);
router.route('/:taskId/completed').post(markCompleted);

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
