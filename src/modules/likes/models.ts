import {
	getModelForClass,
	modelOptions,
	prop,
	type Ref,
} from '@typegoose/typegoose';
import { UserSchema } from '../users/models';
import { CommentSchema } from '../comments/models';

@modelOptions({ schemaOptions: { timestamps: true } })
class CommentLikeSchema {
	@prop({ ref: () => 'CommentSchema', required: true })
	public comment!: Ref<CommentSchema>;

	@prop({ ref: () => 'UserSchema', required: true })
	public owner!: Ref<UserSchema>;
}

export const CommentLike = getModelForClass(CommentLikeSchema);
