import express from "express"
import {
        createMember, getMembersOfWorkSpace,
        getMember, deleteMember, updateMemberPermissions,
} from "./controllers.js";

const router =  express.Router()

router.route("/:workspaceId/ ").get(getMembersOfWorkSpace).post(createMember);

router.route("/:workspaceId/members/:id").get(getMember).patch(updateMemberPermissions).delete(deleteMember);

export default router;
