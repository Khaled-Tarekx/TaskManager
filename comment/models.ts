import { Schema, model, Document } from 'mongoose';
import { IUserDocument } from '../user/models.js'
import { TaskInterface } from '../task/models.js'


export interface CommentInterface extends Document {
    task: TaskInterface,
    owner: IUserDocument,
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


const comment = model<CommentInterface>('Comment', CommentSchema)
export default comment