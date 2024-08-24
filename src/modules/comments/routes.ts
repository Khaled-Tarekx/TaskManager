import { Router } from 'express';
import {
	getComment,
	getTaskComments,
	createComment,
	editComment,
	deleteComment,
} from './controllers';
import { validateResource } from '../auth/utillities';
import { createCommentSchema, updateCommentSchema } from './validation';

const router = Router();
router.get('/', getTaskComments);

router.post(
	'/',
	validateResource({ bodySchema: createCommentSchema }),
	createComment
);

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
