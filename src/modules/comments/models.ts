import { TaskSchema } from '../tasks/models';
import {
	getModelForClass,
	prop,
	type Ref,
	modelOptions,
} from '@typegoose/typegoose';
import { UserSchema } from '../users/models';

@modelOptions({ schemaOptions: { timestamps: true } })
export class CommentSchema {
	@prop({ ref: () => 'TaskSchema', required: true })
	public task!: Ref<TaskSchema>;

	@prop({ ref: () => 'UserSchema', required: true })
	public owner!: Ref<UserSchema>;

	@prop({ ref: () => CommentSchema })
	public parent?: Ref<CommentSchema>;

	@prop({ ref: () => CommentSchema })
	public replies!: Ref<CommentSchema>[];

	@prop({ type: () => String, required: true, minlength: 1 })
	public context!: string;

	@prop({ type: () => Number, default: 0 })
	public replyCount!: number;

	@prop({ type: () => Number, default: 0 })
	public likeCount!: number;
}

const Comment = getModelForClass(CommentSchema);
export { Comment };
