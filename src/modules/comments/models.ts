import { Schema, model, Document } from 'mongoose';


export interface CommentInterface extends Document {
    task: Schema.Types.ObjectId,
    owner: Schema.Types.ObjectId,
    context: string,
}

const CommentSchema: Schema = new Schema(
    {
        task: { type: Schema.Types.ObjectId, ref: 'Task' },
        owner:  { type: Schema.Types.ObjectId, ref: 'User' },
        context: { type: String, minlength: 1 },
      
    },
    { timestamps: true}
)


const Comment = model<CommentInterface>('Comment', CommentSchema)
export default Comment
