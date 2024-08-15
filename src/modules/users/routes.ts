import express from 'express';
import { validateResource } from '../auth/utillities.js';
import {
	getUsers,
	getUser,
	deleteUser,
	updateUserInfo,
} from './controllers.js';
import { deleteUserValidation } from './validations.js';
import { checkRequestUser } from './middlewares.js';

const router = express.Router();

router.route('/').get(getUsers);
router
	.route('/:id')
	.get(getUser)
	.patch(updateUserInfo)
	.delete(
		checkRequestUser,
		validateResource({ paramsSchema: deleteUserValidation }),
		deleteUser
	);

export default router;
