import {getModelForClass, prop, type Ref} from '@typegoose/typegoose';
import {CommentSchema} from "../comments/models";
import {UserSchema} from "../users/models";
import {TimeStamps} from "@typegoose/typegoose/lib/defaultClasses";
import {ReplySchema} from "../replies/models";

class CommentLikeSchema extends TimeStamps {
    @prop({ref: () => CommentSchema, required: true})
    public comment!: Ref<CommentSchema>;

    @prop({ref: () => UserSchema, required: true})
    public owner!: Ref<UserSchema>;
}

class ReplyLikeSchema extends TimeStamps {
    @prop({ref: () => ReplySchema, required: true})
    public reply!: Ref<ReplySchema>;

    @prop({ref: () => UserSchema, required: true})
    public owner!: Ref<UserSchema>;

}

export const CommentLike = getModelForClass(CommentLikeSchema);
export const ReplyLike = getModelForClass(ReplyLikeSchema);

