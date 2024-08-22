import express from 'express';
import {
	getMembersOfWorkSpace,
	getMemberByUsername,
	deleteMember,
	updateMemberPermissions,
} from './controllers';
import { validateResource } from '../../auth/utillities';
import { updateMemberSchema } from './validation';

const router = express.Router();

router.route('/:workspaceId ').get(getMembersOfWorkSpace);

router.post('/search', getMemberByUsername);

router
	.route('/:workspaceId/members/:id')
	.patch(
		validateResource({
			bodySchema: updateMemberSchema,
		}),
		updateMemberPermissions
	)
	.delete(deleteMember);

export default router;
