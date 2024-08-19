import type { z } from 'zod';
import type { updateMemberSchema, createMemberSchema } from './validation';
export enum Role {
	member = 'member',
	owner = 'owner',
}

export type deleteMemberParams = {
	memberId: string;
	workSpaceId: string;
};
export type createMemberDTO = z.infer<typeof createMemberSchema>;
export type updateMemberDTO = z.infer<typeof updateMemberSchema>;
