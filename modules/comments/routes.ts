import { Router } from "express";
import { getComment, getComments, createComment, getUserComments, getUserComment
    , editComment, deleteComment } from "./controllers.js"



const router = Router()
router.route('/').get(getComments).post(createComment)
router.route('/me').get(getUserComments)
router.route('/me/:id').get(getUserComment)
router.route('/:id').get(getComment).patch(editComment).delete(deleteComment)

export default router
