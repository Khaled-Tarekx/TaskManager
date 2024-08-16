import { getModelForClass, prop } from '@typegoose/typegoose';
import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';
import { Position, Roles } from './types.js';

export class UserSchema extends TimeStamps {
	@prop({ type: () => String, required: true })
	public username!: string;

	@prop({ type: () => Boolean })
	public isLoggedIn?: boolean;

	@prop({ enum: Roles, default: Roles.user })
	public roles?: Roles;

	@prop({ type: () => String, required: true, unique: true, index: true })
	public email!: string;

	@prop({
		type: () => String,
		minlength: [6, 'Must be at least 6 characters'],
		maxlength: [100, 'Must be at most 100 characters'],
	})
	public password?: string;

	@prop({ enum: Position, required: true })
	public position!: string;
}

const UserModel = getModelForClass(UserSchema);
export default UserModel;
