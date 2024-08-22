import type { z } from 'zod';
import type {
	acceptInvitationSchema,
	createInviteSchema,
} from './validation';

export type createInviteDTO = z.infer<typeof createInviteSchema>;
export type acceptInviteDTO = z.infer<typeof acceptInvitationSchema>;
