import {
	getModelForClass,
	modelOptions,
	prop,
	pre,
	type Ref,
} from '@typegoose/typegoose';
import { Types } from 'mongoose';
import { Status } from './types';
import { WorkSpaceSchema } from '../workspaces/models';
import { MemberSchema } from '../workspaces/models';
import { nanoid } from 'nanoid';
import { Comment } from '../comments/models';
import { BadRequestError } from '../../custom-errors/main';

@modelOptions({ schemaOptions: { timestamps: true } })
@pre<TaskSchema>('findOneAndDelete', async function (next) {
	try {
		await Comment.deleteMany({ task: this._id });
		next();
	} catch (err: unknown) {
		if (err instanceof BadRequestError) {
			next(new BadRequestError(err.message));
		}
	}
})
export class TaskSchema {
	@prop({ type: String, unique: true, default: () => nanoid(10) })
	public publicId?: string;

	@prop({ type: Number, default: 0 })
	public commentCount?: number;

	@prop({ type: () => Number, required: true, max: 10 })
	public priority!: number;

	@prop({ ref: () => 'MemberSchema', required: true })
	public creator!: Ref<MemberSchema>;

	@prop({ ref: () => 'MemberSchema', required: true })
	public assignee!: Ref<MemberSchema>;

	@prop({ ref: () => 'WorkSpaceSchema', required: true })
	public workspace!: Ref<WorkSpaceSchema>;

	@prop({ type: () => [String], required: true })
	public skill_set!: Types.Array<string>;

	@prop({ type: () => String })
	public attachment?: string;

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
