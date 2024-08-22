import express from 'express';
import { validateResource } from '../auth/utillities';
import { getUsers, getUser, deleteUser, updateUserInfo } from './controllers';
import { updateUserSchema } from './validations';

const router = express.Router();

router.get('/', getUsers);
router.get('/:id', getUser);

router.patch(
	'/update-user',
	validateResource({ bodySchema: updateUserSchema }),
	updateUserInfo
);

router.delete('/update-user', deleteUser);
export default router;
