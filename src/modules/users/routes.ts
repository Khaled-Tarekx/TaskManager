import express from 'express';
import { validateResource } from '../auth/utillities';
import {
	getUsers,
	getUser,
	deleteUser,
	updateUserInfo,
	getUserReplies,
	getUserReply,
	getUserComment,
	getUserComments,
	getUserTasks,
	getUserTask,
} from './controllers';
import { updateUserSchema } from './validations';

const router = express.Router();

router.get('/', getUsers);

router.get('/replies/me/:replyId', getUserReply);
router.get('/replies/me', getUserReplies);
router.get('/tasks/me', getUserTasks);
router.get('/tasks/me/:id', getUserTask);
router.route('/comments/me/:commentId').get(getUserComment);
router.route('/comments/me').get(getUserComments);

router.get('/:userId', getUser);

router.patch(
	'/update-user',
	validateResource({ bodySchema: updateUserSchema }),
	updateUserInfo
);

router.delete('/delete-user', deleteUser);
export default router;
