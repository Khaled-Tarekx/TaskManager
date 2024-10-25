import { Router } from 'express';
import {
	getCommentLikes,
	createCommentLike,
	getUserCommentLike,
	deleteCommentLike,
} from './comment.controllers';

import { createCommentLikeSchema } from './validation';
import { validateResource } from '../../utills/middlewares';

const router = Router();
router.get('/comments/:commentId', getCommentLikes);

router.delete('/comments/:likeId', deleteCommentLike);

router.post(
	'/comments',
	validateResource({ bodySchema: createCommentLikeSchema }),
	createCommentLike
);
router.get('/comments/me/:commentId', getUserCommentLike);

export default router;
