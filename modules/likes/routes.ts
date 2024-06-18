import { Router } from "express";
import { getLike, getLikes, createLike, getUserLikes, getUserLike
    , deleteLike } from "./controllers.js"



const router = Router()
router.route('/').get(getLikes).post(createLike)
router.route('/me').get(getUserLikes)
router.route('/me/:id').get(getUserLike)
router.route('/:id').get(getLike).delete(deleteLike)

export default router
