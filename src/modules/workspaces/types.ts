import type { z } from 'zod';
import type {
	updateWorkSpaceSchema,
	createWorkSpaceSchema,
} from './validation';

export enum Type {
	Operation = 'operation',
	Marketing = 'marketing',
	SmallBusiness = 'small_business',
	SalesCrm = 'sales_crm',
	HumanResources = 'human_resources',
	ItEngineering = 'it_engineering',
	Education = 'education',
	other = 'other',
}

export type workSpaceDTO = z.infer<typeof createWorkSpaceSchema>;
export type updateWorkSpaceDTO = z.infer<typeof updateWorkSpaceSchema>;
