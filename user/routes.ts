import express from "express"
import { getUsers} from "./controllers.ts";

const router =  express.Router()

router.route("/users").get(getUsers).post();
router.route("/users/:id").get().patch().delete();

export default router;
