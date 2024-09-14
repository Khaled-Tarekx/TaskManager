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

	@prop({ type: String, required: true, minlength: 1 })
	public context!: string;

	@prop({ type: Number, default: 0 })
	public replyCount?: number;

	@prop({ type: Number, default: 0 })
	public likeCount?: number;
}

@modelOptions({ schemaOptions: { timestamps: true } })
export class ReplySchema {
	@prop({ ref: () => CommentSchema, required: true })
	public comment!: Ref<CommentSchema>;

	@prop({ ref: () => 'UserSchema', required: true })
	public owner!: Ref<UserSchema>;

	@prop({ ref: () => ReplySchema })
	public parentReply?: Ref<ReplySchema>;

	@prop({ ref: () => ReplySchema })
	public repliesOfReply!: Ref<ReplySchema>[];

	@prop({ type: () => String, required: true, minlength: 1 })
	public context!: string;

	@prop({ type: Number, default: 0 })
	public likeCount!: number;

	@prop({ type: Number, default: 0 })
	public replyCount!: number;
}
const Comment = getModelForClass(CommentSchema);
const Reply = getModelForClass(ReplySchema);
export { Reply, Comment };
