import { Schema, model, Document } from 'mongoose';


export interface LikeInterface extends Document {
    comment: Schema.Types.ObjectId,
    reply: Schema.Types.ObjectId,
    owner: Schema.Types.ObjectId,
}

const LikeSchema: Schema = new Schema(
    {
        comment : { type: Schema.Types.ObjectId, ref: 'Comment' },
        reply : { type: Schema.Types.ObjectId, ref: 'Reply' },
        owner:  { type: Schema.Types.ObjectId, ref: 'User' },
    },
    { timestamps: true}
)


const Like = model<LikeInterface>('Like', LikeSchema)
export default Like
