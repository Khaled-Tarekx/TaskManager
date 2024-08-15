import { Schema, model } from 'mongoose';

export const ReplySchema: Schema = new Schema(
	{
		comment: { type: Schema.Types.ObjectId, ref: 'Comment' },
		owner: { type: Schema.Types.ObjectId, ref: 'User' },
		parentReply: { type: Schema.Types.ObjectId, ref: 'Reply' },
		repliesOfReply: [{ type: Schema.Types.ObjectId, ref: 'Reply' }],
		context: { type: String, minlength: 1 },
	},
	{ timestamps: true }
);

const Reply = model('Reply', ReplySchema);
export default Reply;
