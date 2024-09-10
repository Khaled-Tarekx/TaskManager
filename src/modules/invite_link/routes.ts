import express from 'express';
import { acceptInvitation, createInviteLink } from './controllers';
import { validateResource } from '../../utills/middlewares';
import { acceptInvitationSchema, createInviteSchema } from './validation';

const router = express.Router();

router.post(
	'/invite',
	validateResource({ bodySchema: createInviteSchema }),
	createInviteLink
);

router.post(
	'/accept-invitation',
	validateResource({ bodySchema: acceptInvitationSchema }),
	acceptInvitation
);

export default router;
