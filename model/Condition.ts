import { Schema, model, Document } from 'mongoose';

interface ICondition extends Document {
    name: string;
    persian_name: string;
}

const ConditionSchema = new Schema<ICondition>({
    name: { type: String, required: true },
    persian_name: { type: String, required: true }
});

const Condition = model<ICondition>('Condition', ConditionSchema);

export { Condition, ICondition };