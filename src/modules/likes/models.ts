import {
	getModelForClass,
	modelOptions,
	prop,
	type Ref,
} from '@typegoose/typegoose';
import { CommentSchema } from '../comments/models';
import { UserSchema } from '../users/models';
import { ReplySchema } from '../replies/models';

@modelOptions({ schemaOptions: { timestamps: true } })
class CommentLikeSchema {
	@prop({ ref: () => CommentSchema, required: true })
	public comment!: Ref<CommentSchema>;

	@prop({ ref: () => UserSchema, required: true })
	public owner!: Ref<UserSchema>;
}

@modelOptions({ schemaOptions: { timestamps: true } })
class ReplyLikeSchema {
	@prop({ ref: () => ReplySchema, required: true })
	public reply!: Ref<ReplySchema>;

	@prop({ ref: () => UserSchema, required: true })
	public owner!: Ref<UserSchema>;
}

export const CommentLike = getModelForClass(CommentLikeSchema);
export const ReplyLike = getModelForClass(ReplyLikeSchema);
