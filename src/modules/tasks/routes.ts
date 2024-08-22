import { Router } from 'express';
import {
	getTask,
	getTasks,
	createTask,
	updateTask,
	deleteTask,
	getUserTasks,
	getUserTask,
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
router.route('/me').get(getUserTasks);
router.route('/:id/owner/:assignee_id').post(assignTask);
router.route('/:id/completed').post(markCompleted);
router.route('/me/:id').get(getUserTask);
router
	.route('/:id')
	.get(getTask)
	.patch(
		validateResource({ bodySchema: updateTaskSchema }),
		uploads.single('attachment'),
		updateTask
	)
	.delete(deleteTask);

export default router;
