import mongoose, { Document, model, Schema } from 'mongoose';

export enum Type {
    Operation = 'operation',
    Marketing = 'marketing',
    SmallBusiness = 'small_business',
    SalesCrm = 'sales_crm',
    HumanResources = 'human_resources',
    ItEngineering = 'it_engineering',
    Education = 'education',
    other = 'other',
}

export interface workSpaceInterface extends Document {
    name: string;
    description: string;
    type: Type;
}

const workSpaceSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        description: { type: String },
        type: {
            type: String,
            enum: Object.values(Type),
            default: Type.other,
        },
    },
    { timestamps: true, strict: true }
);

const workSpace = model<workSpaceInterface>('WorkSpace', workSpaceSchema);
export default workSpace;
