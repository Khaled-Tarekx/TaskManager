import express from 'express';
import {
	getMemberByUsername,
	deleteMember,
	updateMemberPermissions,
} from './controllers';
import { validateResource } from '../../auth/utillities';
import { updateMemberSchema } from './validation';

const router = express.Router();

router.get('/members/search', getMemberByUsername);

router
	.route('/:workspaceId/members/:memberId')
	.patch(
		validateResource({
			bodySchema: updateMemberSchema,
		}),
		updateMemberPermissions
	)
	.delete(deleteMember);

export default router;
