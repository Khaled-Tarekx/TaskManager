import { Router } from "express";
import { getReply, getReplies, createReply, getUserReplies, getUserReply
    , editReply, deleteReply } from "./controllers.js"



const router = Router()
router.route('/').get(getReplies).post(createReply)
router.route('/me').get(getUserReplies)
router.route('/me/:id').get(getUserReply)
router.route('/:id').get(getReply).patch(editReply).delete(deleteReply)

export default router
