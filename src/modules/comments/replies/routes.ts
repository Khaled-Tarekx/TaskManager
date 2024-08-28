import { Router } from 'express';
import { validateResource } from '../../auth/utillities';
import {
	getReply,
	getReplies,
	createReply,
	editReply,
	deleteReply,
	getCommentReplies,
} from './controllers';
import { createReplySchema, updateReplySchema } from './validation';

const router = Router();
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
