import {Router} from 'express';
import {
    getComment,
    getTaskComments,
    createComment,
    getUserComments,
    getUserComment,
    editComment,
    deleteComment,
} from './controllers.js';
import {validateResource} from '../auth/utillities.js';
import {
    commentParamSchema,
    createCommentSchema,
    updateCommentSchema,
} from './validation.js';

const router = Router();
router
    .route('/')
    .get(getTaskComments)
    .post(validateResource({bodySchema: createCommentSchema}), createComment);
router.route('/me').get(getUserComments);
router.route('/me/:id').get(getUserComment);
router
    .route('/:id')
    .get(
        validateResource({
            paramsSchema: commentParamSchema,
        }),
        getComment
    )
    .patch(
        validateResource({
            bodySchema: updateCommentSchema,
            paramsSchema: commentParamSchema,
        }),
        editComment
    )
    .delete(
        validateResource({
            paramsSchema: commentParamSchema,
        }),
        deleteComment
    );

export default router;
