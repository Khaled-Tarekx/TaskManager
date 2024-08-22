import { Router } from 'express';
import {
	getComment,
	getTaskComments,
	createComment,
	getUserComments,
	getUserComment,
	editComment,
	deleteComment,
} from './controllers';
import { validateResource } from '../auth/utillities';
import { createCommentSchema, updateCommentSchema } from './validation';

const router = Router();
router.get('/:taskId', getTaskComments);

router.post(
	'/',
	validateResource({ bodySchema: createCommentSchema }),
	createComment
);
router.route('/me/:commentId').get(getUserComment);

router.route('/me').get(getUserComments);

router
	.route('/:commentId')
	.get(getComment)
	.patch(
		validateResource({
			bodySchema: updateCommentSchema,
		}),
		editComment
	)
	.delete(deleteComment);

export default router;
