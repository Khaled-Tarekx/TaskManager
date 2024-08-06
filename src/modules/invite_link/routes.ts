import express from "express"
import {
       createInviteLink,
} from "./controllers.js";
import { validateResource } from "../auth/utillities.js";
import { inviteLinkValidation } from "./validation.js";

const router =  express.Router()

router.route("/:workspaceId/invite/").post(validateResource({bodySchema: inviteLinkValidation}),createInviteLink);
router.route("/:workspaceId/invite/:id").post(validateResource({bodySchema: inviteLinkValidation}),createInviteLink);

export default router;
