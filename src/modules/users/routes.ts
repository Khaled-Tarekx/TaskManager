import express from 'express';
import { validateResource } from '../auth/utillities.js';
import {
	getUsers,
	getUser,
	deleteUser,
	updateUserInfo,
} from './controllers.js';
import { checkRequestUser } from './middlewares.js';
import { updateUserSchema } from './validations.js';

const router = express.Router();

router.get('/', getUsers);
router.get('/:id', getUser);

router.patch(
	'/update-user',
	validateResource({ bodySchema: updateUserSchema }),
	updateUserInfo
);

router.delete('/update-user', checkRequestUser, deleteUser);
export default router;
