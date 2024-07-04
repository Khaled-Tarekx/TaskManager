import { Schema, model, Document } from 'mongoose';


export interface CommentLikeInterface extends Document {
    comment: Schema.Types.ObjectId,
    owner: Schema.Types.ObjectId,
}


export interface ReplyLikeInterface extends Document {
    reply: Schema.Types.ObjectId,
    owner: Schema.Types.ObjectId,
}

const CommentLikeSchema: Schema = new Schema(
    {
        comment : { type: Schema.Types.ObjectId, ref: 'Comment' },
        owner:  { type: Schema.Types.ObjectId, ref: 'User' },
    },
    { timestamps: true}
)

const ReplyLikeSchema: Schema = new Schema(
    {
        reply : { type: Schema.Types.ObjectId, ref: 'Reply' },
        owner:  { type: Schema.Types.ObjectId, ref: 'User' },
    },
    { timestamps: true}
)


const CommentLike = model<CommentLikeInterface>('CommentLike', CommentLikeSchema)
const ReplyLike = model<ReplyLikeInterface>('ReplyLike', ReplyLikeSchema)

export { CommentLike, ReplyLike }
