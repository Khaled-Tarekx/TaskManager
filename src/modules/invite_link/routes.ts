import express from "express"
import {
       createInviteLink,
} from "./controllers.js";

const router =  express.Router()

router.route("/:workspaceId/invite/ ").post(createInviteLink);

export default router;
