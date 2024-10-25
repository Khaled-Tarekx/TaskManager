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
import {
	getReply,
	getReplies,
	createReply,
	editReply,
	deleteReply,
	getCommentReplies,
} from './controllers';
import { createReplySchema, updateReplySchema } from './validation';

router
	.route('/')
	.get(getReplies)
	.post(validateResource({ bodySchema: createReplySchema }), createReply);

router.get('/comments', getCommentReplies);

router
	.route('/:replyId')
	.get(getReply)
	.patch(validateResource({ bodySchema: updateReplySchema }), editReply)
	.delete(deleteReply);

export default router;
