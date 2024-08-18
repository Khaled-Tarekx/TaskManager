import type { z } from 'zod';
import type {
	acceptInvitationSchema,
	createInviteSchema,
} from './validation.js';

export type createInviteDTO = z.infer<typeof createInviteSchema>;
export type acceptInviteDTO = z.infer<typeof acceptInvitationSchema>;
