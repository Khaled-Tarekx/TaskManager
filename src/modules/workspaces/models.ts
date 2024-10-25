import {
	getModelForClass,
	modelOptions,
	prop,
	type Ref,
} from '@typegoose/typegoose';
import { Type } from './types';
import { UserSchema } from '../users/models';
import { Role } from './members/types';

@modelOptions({ schemaOptions: { timestamps: true } })
export class MemberSchema {
	@prop({ ref: () => WorkSpaceSchema, required: true })
	public workspace!: Ref<WorkSpaceSchema>;

	@prop({ ref: () => 'UserSchema', required: true })
	public user!: Ref<UserSchema>;

	@prop({ type: () => String, enum: Role, default: Role.member })
	public role!: Role;
}

@modelOptions({ schemaOptions: { timestamps: true } })
export class WorkSpaceSchema {
	@prop({ type: () => String, required: true })
	public name!: string;

	@prop({ type: () => String })
	public description?: string;

	@prop({ ref: () => MemberSchema, required: true })
	public owner!: Ref<MemberSchema>;

	@prop({ type: () => String, enum: Type, default: Type.other })
	public type!: Type;
}

const Member = getModelForClass(MemberSchema);
const WorkSpace = getModelForClass(WorkSpaceSchema);

export { Member, WorkSpace };
