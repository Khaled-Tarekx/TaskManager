import {getModelForClass, modelOptions, prop, type Ref} from '@typegoose/typegoose';
import { Type } from './types';
import { UserSchema } from '../users/models';
import { Role } from '../work_space_members/types';


@modelOptions({ schemaOptions: { timestamps: true } })
export class WorkSpaceSchema {
	@prop({ type: () => String, required: true })
	public name!: string;

	@prop({ type: () => String })
	public description?: string;

	@prop({ ref: () => MemberSchema, required: true })
	public owner!: Ref<MemberSchema>;

	@prop({ enum: Type, default: Type.other })
	public type!: Type;
}


@modelOptions({ schemaOptions: { timestamps: true } })
export class MemberSchema {
	@prop({ ref: () => WorkSpaceSchema, required: true })
	public workspace!: Ref<WorkSpaceSchema>;

	@prop({ ref: UserSchema, required: true })
	public member!: Ref<UserSchema>;

	@prop({ enum: Role, default: Role.member })
	public role!: Role;
}

const Member = getModelForClass(MemberSchema);
const WorkSpace = getModelForClass(WorkSpaceSchema);

export { Member, WorkSpace };