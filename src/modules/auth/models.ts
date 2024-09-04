import { getModelForClass, modelOptions, prop } from '@typegoose/typegoose';
import { UserSchema } from '../users/models';

@modelOptions({ schemaOptions: { timestamps: true, id: true } })
export class UserRefreshTokenSchema {
	@prop({ Ref: () => UserSchema, required: true })
	public user!: UserSchema;

	@prop({ type: () => String })
	public token!: string;
}

const UserRefreshToken = getModelForClass(UserRefreshTokenSchema);
export default UserRefreshToken;
