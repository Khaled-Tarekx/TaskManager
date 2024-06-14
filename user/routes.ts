import express from "express"
import { getUsers,
        getUser, deleteUser, updateUserInfo } from "./controllers.js";

const router =  express.Router()

router.route("/").get(getUsers);
router.route("/:id").get(getUser).patch(updateUserInfo).delete(deleteUser);

export default router;
