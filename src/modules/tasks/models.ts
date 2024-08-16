import { getModelForClass, prop, type Ref } from '@typegoose/typegoose';
import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';
import { Types } from 'mongoose';
import { Status } from './types.js';
import { UserSchema } from '../users/models.js';

export class TaskSchema extends TimeStamps {
	@prop({ type: () => Number, required: true, max: 10 })
	public priority!: number;

	@prop({ ref: () => UserSchema, required: true })
	public owner!: Ref<UserSchema>;

	@prop({ type: () => [String], required: true })
	public skill_set!: Types.Array<string>;

	@prop({ type: () => String, required: true })
	public attachment!: string;

	@prop({ required: true })
	public dead_line!: Date;

	@prop({ ref: () => TaskSchema })
	public dependants?: Types.Array<Ref<TaskSchema>>;

	@prop({
		enum: Status,
		default: Status.Unassigned,
	})
	public status!: Status;
}

const TaskModel = getModelForClass(TaskSchema);

export default TaskModel;
