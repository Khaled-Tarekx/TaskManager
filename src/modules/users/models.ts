import { getModelForClass, modelOptions, prop } from '@typegoose/typegoose';
import { Position, Roles } from '../auth/types';

@modelOptions({ schemaOptions: { timestamps: true, id: true } })
export class UserSchema {
	@prop({ type: () => String, required: true })
	public username!: string;

	@prop({ type: () => Boolean })
	public isLoggedIn?: boolean;

	@prop({ type: () => String, enum: Roles, default: Roles.user })
	public roles?: Roles;

	@prop({ type: () => String, required: true, unique: true, index: true })
	public email!: string;

	@prop({
		type: () => String,
		minlength: [6, 'Must be at least 6 characters'],
		maxlength: [100, 'Must be at most 100 characters'],
	})
	public password?: string;

	@prop({ type: () => String, enum: Position, required: true })
	public position!: Position;
}

const UserModel = getModelForClass(UserSchema);
export default UserModel;
