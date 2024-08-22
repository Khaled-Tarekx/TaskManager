import { Router } from 'express';
import { validateResource } from '../auth/utillities';
import {
	getReply,
	getReplies,
	createReply,
	getUserReplies,
	getUserReply,
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

router.get('/:commentId', getCommentReplies);

router.get('/me', getUserReplies);
router.get('/me/:id', getUserReply);

router
	.route('/:id')
	.get(getReply)
	.patch(validateResource({ bodySchema: updateReplySchema }), editReply)
	.delete(deleteReply);

export default router;
