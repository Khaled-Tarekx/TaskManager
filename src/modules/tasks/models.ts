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
		await TaskModel.deleteMany({ parentTask: this._id });

		await Comment.deleteMany({ task: this._id });
		next();
	} catch (err: unknown) {
		if (err instanceof BadRequestError) {
			next(new BadRequestError(err.message));
		}
	}
})
export class TaskSchema {
	@prop({ type: String, required: true })
	public title!: string;
	@prop({ type: String, required: true })
	public description!: string;

	@prop({ type: () => Number, required: true, max: 10 })
	public priority!: number;
	@prop({ type: String, unique: true, default: () => nanoid(10) })
	public publicId?: string;

	@prop({ type: Number, default: 0 })
	public commentCount?: number;

	@prop({ ref: () => 'MemberSchema', required: true })
	public creator!: Ref<MemberSchema>;

	@prop({ ref: () => 'MemberSchema', required: true })
	public assignees!: Types.Array<Ref<MemberSchema>>;

	@prop({ ref: () => 'WorkSpaceSchema', required: true })
	public workspace!: Ref<WorkSpaceSchema>;

	@prop({ type: () => [String], required: true })
	public tags!: Types.Array<string>;

	@prop({ type: () => String })
	public attachment?: string;

	@prop({ required: true })
	public deadline!: Date;

	@prop({ ref: () => TaskSchema })
	public subtasks?: Types.Array<Ref<TaskSchema>>;

	@prop({ ref: () => TaskSchema })
	public parentTask?: Ref<TaskSchema>;

	@prop({
		enum: Status,
		default: Status.Unassigned,
	})
	public status!: Status;

	@prop({ type: () => Map })
	public customFields?: Map<string, string>;
}

const TaskModel = getModelForClass(TaskSchema);

export default TaskModel;
