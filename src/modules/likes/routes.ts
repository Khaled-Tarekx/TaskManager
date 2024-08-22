import { Router } from 'express';
import {
	getCommentLike,
	getCommentLikes,
	createCommentLike,
	getUserCommentLike,
	deleteCommentLike,
} from './comment.controllers';

import {
	getReplyLike,
	getReplyLikes,
	createReplyLike,
	getUserReplyLike,
	deleteReplyLike,
} from './reply.controllers';
import { createCommentLikeSchema, createReplyLikeSchema } from './validation';
import { validateResource } from '../auth/utillities';

const router = Router();
router
	.route('/comments')
	.get(getCommentLikes)
	.post(
		validateResource({ bodySchema: createCommentLikeSchema }),
		createCommentLike
	);
router.route('/comments/me/:id').get(getUserCommentLike);
router.route('/comments/:id').get(getCommentLike).delete(deleteCommentLike);

router
	.route('/replies')
	.get(getReplyLikes)
	.post(
		validateResource({ bodySchema: createReplyLikeSchema }),
		createReplyLike
	);
router.route('/replies/me/').get(getUserReplyLike);
router.route('/replies/:id').get(getReplyLike).delete(deleteReplyLike);

export default router;
