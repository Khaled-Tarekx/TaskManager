import express from 'express';
import { createInviteLink } from './controllers.js';
import { validateResource } from '../auth/utillities.js';
import { createInviteSchema } from './validation.js';

const router = express.Router();

router
	.route('/:workspaceId/invite/')
	.post(
		validateResource({ bodySchema: createInviteSchema }),
		createInviteLink
	);
router
	.route('/:workspaceId/invite/:id')
	.post(
		validateResource({ bodySchema: createInviteSchema }),
		createInviteLink
	);

export default router;
