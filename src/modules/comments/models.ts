import TaskModel, { TaskSchema } from '../tasks/models';
import {
	getModelForClass,
	prop,
	type Ref,
	pre,
	modelOptions,
} from '@typegoose/typegoose';
import { UserSchema } from '../users/models';
import { CommentLike, ReplyLike } from '../likes/models';
import { BadRequestError } from '../../custom-errors/main';

@modelOptions({ schemaOptions: { timestamps: true } })
@pre<CommentSchema>('findOneAndDelete', async function (next) {
	try {
		await CommentLike.deleteMany({ comment: this._id });
		if (this.task) {
			await TaskModel.findByIdAndUpdate(this.task, {
				$inc: { commentCount: -1 },
			});
		}
		next();
	} catch (err: unknown) {
		if (err instanceof BadRequestError) {
			next(new BadRequestError(err.message));
		}
	}
})
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
@pre<ReplySchema>('findOneAndDelete', async function (next) {
	try {
		await ReplyLike.deleteMany({ reply: this._id });
		if (this.parentReply) {
			await Reply.findByIdAndUpdate(this.parentReply, {
				$inc: { replyCount: -1 },
			});
		}
		if (this.comment) {
			await Comment.findByIdAndUpdate(this.comment, {
				$inc: { replyCount: -1 },
			});
		}
		next();
	} catch (err: unknown) {
		if (err instanceof BadRequestError) {
			next(new BadRequestError(err.message));
		}
	}
})
export class ReplySchema {
	@prop({ ref: () => CommentSchema, required: true })
	public comment!: Ref<CommentSchema>;

	@prop({ ref: () => 'UserSchema', required: true })
	public owner!: Ref<UserSchema>;

	@prop({ ref: () => ReplySchema })
	public parentReply?: Ref<ReplySchema>;

	@prop({ ref: () => ReplySchema })
	public repliesOfReply?: Ref<ReplySchema>[];

	@prop({ type: () => String, required: true, minlength: 1 })
	public context!: string;

	@prop({ type: Number, default: 0 })
	public likeCount?: number;

	@prop({ type: Number, default: 0 })
	public replyCount?: number;
}
const Comment = getModelForClass(CommentSchema);
const Reply = getModelForClass(ReplySchema);
export { Reply, Comment };
