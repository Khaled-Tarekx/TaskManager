import express from 'express';
import { validateResource } from '../auth/utillities';
import { getUsers, getUser, deleteUser, updateUserInfo } from './controllers';
import { updateUserSchema } from './validations';

const router = express.Router();

router.get('/', getUsers);
router.get('/:userId', getUser);

router.patch(
	'/update-user',
	validateResource({ bodySchema: updateUserSchema }),
	updateUserInfo
);

router.delete('/delete-user', deleteUser);
export default router;
