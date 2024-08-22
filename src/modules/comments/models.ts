import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';
import { TaskSchema } from '../tasks/models';
import { getModelForClass, prop, type Ref } from '@typegoose/typegoose';
import { UserSchema } from '../users/models';

export class CommentSchema extends TimeStamps {
	@prop({ ref: TaskSchema, required: true })
	public task!: Ref<TaskSchema>;

	@prop({ ref: UserSchema, required: true })
	public owner!: Ref<UserSchema>;

	@prop({ type: String, required: true, minlength: 1 })
	public context!: string;

	@prop({ type: Number, default: 0 })
	public replyCount?: number;

	@prop({ type: Number, default: 0 })
	public likeCount?: number;
}

const CommentModel = getModelForClass(CommentSchema);
export default CommentModel;
