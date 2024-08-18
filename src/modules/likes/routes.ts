import {Router} from "express";
import {
    getCommentLike, getCommentLikes, createCommentLike, getUserCommentLikes, getUserCommentLike
    , deleteCommentLike
} from "./comment.controllers.js"

import {
    getReplyLike, getReplyLikes, createReplyLike, getUserReplyLike, deleteReplyLike

} from "./reply.controllers.js"

const router = Router()
router.route('/comments').get(getCommentLikes).post(createCommentLike)
router.route('/comments/me').get(getUserCommentLikes)
router.route('/comments/me/:id').get(getUserCommentLike)
router.route('/comments/:id').get(getCommentLike).delete(deleteCommentLike)

router.route('/replies').get(getReplyLikes).post(createReplyLike)
router.route('/replies/me/').get(getUserReplyLike)
router.route('/replies/:id').get(getReplyLike).delete(deleteReplyLike)


export default router
