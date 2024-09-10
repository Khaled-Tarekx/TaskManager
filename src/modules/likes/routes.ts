import { Router } from 'express';
import {
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
import { validateResource } from '../../utills/middlewares';

const router = Router();
router.get('/comments/:commentId', getCommentLikes);

router.delete('/comments/:likeId', deleteCommentLike);

router.post(
	'/comments',
	validateResource({ bodySchema: createCommentLikeSchema }),
	createCommentLike
);
router.route('/comments/me/:commentId').get(getUserCommentLike);

router.get('/replies/:replyId', getReplyLikes);

router.delete('/replies/:likeId', deleteReplyLike);

router.post(
	'/replies',
	validateResource({ bodySchema: createReplyLikeSchema }),
	createReplyLike
);
router.route('/replies/me/:replyId').get(getUserReplyLike);
// router.get('/replies/:replyId', getReplyLike); // TODO:  is this necessary?

export default router;
