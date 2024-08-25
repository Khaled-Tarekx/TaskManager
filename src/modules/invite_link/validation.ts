import z from 'zod';

export const createInviteSchema = z.object({
	receiverId: z.string({
		required_error: 'receiverId is required',
		invalid_type_error: 'receiverId must be a string',
	}),
	workspaceId: z.string({
		required_error: 'workspaceId is required',
		invalid_type_error: 'workspaceId must be a string',
	}),
});

export const acceptInvitationSchema = z.object({
	token: z.string({
		required_error: 'token is required',
		invalid_type_error: 'token must be a string',
	}),
});
