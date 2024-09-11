import express from 'express';
import {
	getMemberByUsername,
	deleteMember,
	updateMemberPermissions,
} from './controllers';
import { validateResource } from '../../../utills/middlewares';
import { updateMemberSchema } from './validation';

const router = express.Router();

router.get('/search/members', getMemberByUsername);

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
