import { model, Schema } from 'mongoose';

const regexString = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const userSchema = new Schema(
	{
		username: { type: String, required: true },
		isLoggedIn: { type: Boolean, default: false },
		roles: {
			type: String,
			default: 'user',
			enum: {
				values: ['user', 'admin'],
				message: '{VALUE} is not supported',
			},
		},
		email: {
			type: String,
			required: true,
			match: [regexString, "Email: {VALUE} isn't a valid email"],
			index: { unique: true },
		},
		password: {
			type: String,
			minlength: [6, 'Must be at least 6'],
			maxlength: 255,
		},
		position: {
			type: String,
			enum: {
				values: ['Front-End', 'Back-End'],
				message: '{VALUE} is not supported',
			},
		},
	},
	{ timestamps: true, strict: true }
);

const User = model('User', userSchema);
export default User;
