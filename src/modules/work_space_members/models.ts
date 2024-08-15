import mongoose, { Document, model, Schema } from 'mongoose';

export enum Role {
	Member = 'member',
	Owner = 'owner',
}

const workSpaceMembersSchema: Schema = new Schema(
	{
		workspace: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Workspace',
			required: true,
		},
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		role: {
			type: String,
			enum: Object.values(Role),
			default: Role.Member,
		},
	},
	{ timestamps: true, strict: true }
);

const workSpaceMembers = model('WorkSpaceMembers', workSpaceMembersSchema);
export default workSpaceMembers;
