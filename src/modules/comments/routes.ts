import { Router } from 'express';
import {
	getComment,
	getTaskComments,
	createComment,
	editComment,
	deleteComment,
} from './controllers';
import { validateResource } from '../../utills/middlewares';
import { createCommentSchema, updateCommentSchema } from './validation';

const router = Router();
router.get('/', getTaskComments);
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
router.post(
	'/',
	validateResource({ bodySchema: createCommentSchema }),
	createComment
);

export default router;
