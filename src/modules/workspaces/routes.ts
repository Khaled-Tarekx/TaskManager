import express from 'express';
import {
	getWorkSpaces,
	getMembersOfWorkSpace,
	createWorkSpace,
	getWorkSpace,
	deleteWorkSpace,
	updateWorkSpace,
} from './controllers';

const router = express.Router();
router.route('/members/:workspaceId/').get(getMembersOfWorkSpace);

router.route('/').get(getWorkSpaces).post(createWorkSpace);

router
	.route('/:workspaceId')
	.get(getWorkSpace)
	.patch(updateWorkSpace)
	.delete(deleteWorkSpace);

export default router;
