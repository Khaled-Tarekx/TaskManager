import { Router } from "express";
import { getComment, getComments, createComment
    , updateComment, deleteComment } from "./controllers.js"



const router = Router()
router.route('/').get(getComments).post(createComment)
router.route('/:id').get(getComment).patch(updateComment).delete(deleteComment)

export default router
