import { getModelForClass, prop, type Ref } from '@typegoose/typegoose';
import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';
import { MemberSchema } from '../work_space_members/models.js';
import { Type } from './types.js';

export class WorkSpaceSchema extends TimeStamps {
	@prop({ type: () => String, required: true })
	public name!: string;

	@prop({ type: () => String })
	public description?: string;

	@prop({ ref: MemberSchema, required: true })
	public owner!: Ref<MemberSchema>;

	@prop({ enum: Type, default: Type.other })
	public type!: Type;
}

const WorkSpaceModel = getModelForClass(WorkSpaceSchema);
export default WorkSpaceModel;
