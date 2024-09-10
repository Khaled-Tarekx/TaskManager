import express from 'express';
import { validateResource } from '../../utills/middlewares';
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
import { changePasswordSchema } from '../auth/validation';
import { changePassword } from '../auth/controllers';

const router = express.Router();

router.get('/', getUsers);

router.get('/replies/me/:replyId', getUserReply);
router.get('/replies/me', getUserReplies);
router.get('/tasks/me', getUserTasks);
router.get('/tasks/me/:id', getUserTask);
router.route('/comments/me/:commentId').get(getUserComment);
router.route('/comments/me').get(getUserComments);

router.get('/:userId', getUser);

router.put(
	'/update-user',
	validateResource({ bodySchema: updateUserSchema }),
	updateUserInfo
);

router.patch(
	'/change-password',
	validateResource({ bodySchema: changePasswordSchema }),
	changePassword
);

router.delete('/delete-user', deleteUser);
export default router;
