import {Schema, model, Document, Model} from 'mongoose';
import {IParameter} from "./Parameter";

interface IParameterLimit extends Document {
    patient: Schema.Types.ObjectId;
    parameter_name: string;
    upper_limit: number;
    lower_limit: number;
}

interface IParameterLimitModel extends Model<IParameter>{
    isParameterOutOfBounds(parameter: IParameter): Promise<boolean>;
}

const ParameterLimitSchema = new Schema<IParameterLimit>({
    patient: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    parameter_name: { type: String, required: true },
    upper_limit: { type: Number, required: true },
    lower_limit: { type: Number, required: true }
});

ParameterLimitSchema.statics.isParameterOutOfBounds = async function (parameter: IParameter): Promise<boolean> {
    const limit = await ParameterLimit.findOne({ patient: parameter.patient, parameter_name: parameter.parameter });
    if (!limit) {
        return false;
    }
    return parameter.value > limit.upper_limit || parameter.value < limit.lower_limit;
}

const ParameterLimit = model<IParameterLimit, IParameterLimitModel>('ParameterLimit', ParameterLimitSchema);

export { ParameterLimit, IParameterLimit };