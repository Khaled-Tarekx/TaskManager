import { prop, type Ref, getModelForClass } from '@typegoose/typegoose';

import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';
import { CommentSchema } from '../comments/models';
import { UserSchema } from '../users/models';

export class ReplySchema extends TimeStamps {
	@prop({ ref: () => CommentSchema, required: true })
	public comment!: Ref<CommentSchema>;

	@prop({ ref: () => UserSchema, required: true })
	public owner!: Ref<UserSchema>;

	@prop({ ref: () => ReplySchema })
	public parentReply?: Ref<ReplySchema>;

	@prop({ ref: () => ReplySchema, default: [] })
	public repliesOfReply?: Ref<ReplySchema>[];

	@prop({ type: () => String, required: true, minlength: 1 })
	public context!: string;

	@prop({ type: Number, default: 0 })
	public likeCount?: number;
}

const ReplyModel = getModelForClass(ReplySchema);
export default ReplyModel;
