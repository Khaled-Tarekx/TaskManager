import {
	getModelForClass,
	modelOptions,
	pre,
	prop,
	type Ref,
} from '@typegoose/typegoose';
import { Type } from './types';
import { UserSchema } from '../users/models';
import { Role } from './members/types';
import TaskModel from '../tasks/models';
import { BadRequestError } from '../../custom-errors/main';

@modelOptions({ schemaOptions: { timestamps: true } })
export class MemberSchema {
	@prop({ ref: () => WorkSpaceSchema, required: true })
	public workspace!: Ref<WorkSpaceSchema>;

	@prop({ ref: () => 'UserSchema', required: true })
	public user!: Ref<UserSchema>;

	@prop({ enum: Role, default: Role.member })
	public role!: Role;
}

@modelOptions({ schemaOptions: { timestamps: true } })
@pre<WorkSpaceSchema>('findOneAndDelete', async function (next) {
	try {
		await TaskModel.deleteMany({ workspace: this._id });
		await Member.deleteMany({ workspace: this._id });
		next();
	} catch (err: unknown) {
		if (err instanceof BadRequestError) {
			next(new BadRequestError(err.message));
		}
	}
})
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

const Member = getModelForClass(MemberSchema);
const WorkSpace = getModelForClass(WorkSpaceSchema);

export { Member, WorkSpace };
