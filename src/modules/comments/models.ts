import { Schema, model } from 'mongoose';

export const CommentSchema: Schema = new Schema(
	{
		task: { type: Schema.Types.ObjectId, ref: 'Task', required: true },
		owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
		context: { type: String, minlength: 1 },
	},
	{ timestamps: true }
);

const Comment = model('Comment', CommentSchema);
export default Comment;
