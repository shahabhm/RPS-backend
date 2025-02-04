import { Schema, model, Document } from 'mongoose';

interface IAllergy extends Document {
    name: string;
    persian_name: string;
}

const allergySchema = new Schema<IAllergy>({
    name: { type: String, required: true },
    persian_name: { type: String, required: true }
});

const Allergy = model<IAllergy>('Allergy', allergySchema);

export { Allergy, IAllergy };