import express from 'express';
import {
	getWorkSpaces,
	createWorkSpace,
	getWorkSpace,
	deleteWorkSpace,
	updateWorkSpace,
} from './controllers';

const router = express.Router();

router.route('/').get(getWorkSpaces).post(createWorkSpace);
router
	.route('/:id')
	.get(getWorkSpace)
	.patch(updateWorkSpace)
	.delete(deleteWorkSpace);

export default router;
