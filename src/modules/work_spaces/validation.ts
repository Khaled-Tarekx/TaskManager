import z from 'zod';

const typeEnum = [
	'operation',
	'marketing',
	'small_business',
	'sales_crm',
	'human_resources',
	'it_engineering',
	'education',
	'other',
] as const;

export const workSpaceSchema = z.object({
	name: z.string(),
	description: z.string(),
	type: z.enum(typeEnum).default(typeEnum[7]),
});

export const updateWorkSpaceSchema = z.object({
	name: z.string(),
});

export type workSpaceDTO = z.infer<typeof workSpaceSchema>;
export type updateWorkSpaceDTO = z.infer<typeof updateWorkSpaceSchema>;
