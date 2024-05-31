import express from "express"
import { getUsers, register, login, 
        getUser, deleteUser, updateUser } from "./controllers.js";

const router =  express.Router()

router.route("/").get(getUsers);
router.route("/register").post(register)
router.route("/login").post(login)
router.route("/:id").get(getUser).patch(updateUser).delete(deleteUser);

export default router;
