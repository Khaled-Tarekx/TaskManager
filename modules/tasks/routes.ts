import { Router } from "express";
import { getTask, getTasks, 
    createTask, updateTask, deleteTask, getUserTasks,
     getUserTask, assignTask, markCompleted } from "./controllers.js";


const router = Router()
router.route('/').get(getTasks).post(createTask)
router.route('/me').get(getUserTasks)
router.route('/:id/owner/:user_id').post(assignTask)
router.route('/:id/completed').post(markCompleted)
router.route('/me/:id').get(getUserTask)
router.route('/:id').get(getTask).patch(updateTask).delete(deleteTask)


export default router
