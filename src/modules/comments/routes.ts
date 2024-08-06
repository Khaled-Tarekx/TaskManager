import { Router } from "express";
import { getComment, getComments, createComment, getUserComments, getUserComment
    , editComment, deleteComment } from "./controllers.js"
import { validateResource } from "../auth/utillities.js";
import { commentValidation } from "./validation.js";



const router = Router()
router.route('/').get(getComments).post(validateResource({bodySchema: commentValidation}), createComment)
router.route('/me').get(getUserComments)
router.route('/me/:id').get(getUserComment)
router.route('/:id').get(getComment).patch(validateResource({bodySchema: commentValidation}),editComment).delete(deleteComment)

export default router
