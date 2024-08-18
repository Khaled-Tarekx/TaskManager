import express from 'express';
import {
	createMember,
	getMembersOfWorkSpace,
	getMember,
	deleteMember,
	updateMemberPermissions,
} from './controllers.js';
import { validateResource } from '../auth/utillities.js';
import {
	createMemberSchema,
	updateMemberSchema,
	validateMemberParams,
} from './validation.js';

const router = express.Router();

router
	.route('/:workspaceId/ ')
	.get(getMembersOfWorkSpace)
	.post(validateResource({ bodySchema: createMemberSchema }), createMember);

router
	.route('/:workspaceId/members/:id')
	.get(validateResource({ paramsSchema: validateMemberParams }), getMember)
	.patch(
		validateResource({
			paramsSchema: validateMemberParams,
			bodySchema: updateMemberSchema,
		}),
		updateMemberPermissions
	)
	.delete(
		validateResource({ paramsSchema: validateMemberParams }),
		deleteMember
	);

export default router;
