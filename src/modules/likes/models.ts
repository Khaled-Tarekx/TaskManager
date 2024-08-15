import {Schema, model} from 'mongoose';

const CommentLikeSchema = new Schema(
	{
		comment: {type: Schema.Types.ObjectId, ref: 'Comment'},
		owner: {type: Schema.Types.ObjectId, ref: 'User'},
	},
	{timestamps: true}
);

const ReplyLikeSchema = new Schema(
	{
		reply: {type: Schema.Types.ObjectId, ref: 'Reply'},
		owner: {type: Schema.Types.ObjectId, ref: 'User'},
	},
	{timestamps: true}
);

const CommentLike = model('CommentLike', CommentLikeSchema);
const ReplyLike = model('ReplyLike', ReplyLikeSchema);

export {CommentLike, ReplyLike};
