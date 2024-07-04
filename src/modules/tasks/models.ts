 import mongoose, { Schema, model, Document } from 'mongoose';

export interface TaskInterface extends Document {
    priority: number,
    owner:  mongoose.Types.ObjectId,
    skill_set: [string],
    attachment: String ,
    dead_line: Date,
    status: String,
    dependants:  mongoose.Types.ObjectId[],
}

const TaskSchema: Schema = new Schema(
    {
        priority: { type: Number, required: true, max: 10 },
        owner:  { type: Schema.Types.ObjectId, ref: 'User' },
        skill_set: [{ type: String }],
        attachment: { type: String },
        dead_line: { type: Date, required: true },
        dependants: [{ type: Schema.Types.ObjectId, ref: 'Task' }],
        status: { type: String, 
            enum: ['unAssigned', 'inProgress', 'completed'],
            default: 'unAssigned' }
    },
    { timestamps: true}
)



const Task = model<TaskInterface>('Task', TaskSchema)
export default Task