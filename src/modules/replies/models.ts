import { Schema, model, Document } from 'mongoose';


export interface ReplyInterface extends Document {
    comment: Schema.Types.ObjectId,
    owner: Schema.Types.ObjectId,
    parentReply: Schema.Types.ObjectId,
    repliesOfReply: Schema.Types.ObjectId[],
    context: string,
}

const ReplySchema: Schema = new Schema(
    {
        comment: { type: Schema.Types.ObjectId, ref: 'Comment' },
        owner:  { type: Schema.Types.ObjectId, ref: 'User' },
        parentReply:  { type: Schema.Types.ObjectId, ref: 'Reply' },
        repliesOfReply: [{ type: Schema.Types.ObjectId, ref: 'Reply' }],
        context: { type: String, minlength: 1 },
    },
    { timestamps: true }
)


const Reply = model<ReplyInterface>('Reply', ReplySchema)
export default Reply
