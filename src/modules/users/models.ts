import {
	getModelForClass,
	modelOptions,
	prop,
	pre,
} from '@typegoose/typegoose';
import { Position, Roles } from '../auth/types';
import { Member } from '../workspaces/models';
import { BadRequestError } from '../../custom-errors/main';

@modelOptions({ schemaOptions: { timestamps: true, id: true } })
@pre<UserSchema>('findOneAndDelete', async function (next) {
	try {
		await Member.deleteMany({ user: this._id });
		next();
	} catch (err: unknown) {
		if (err instanceof BadRequestError) {
			next(new BadRequestError(err.message));
		}
	}
})
export class UserSchema {
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
