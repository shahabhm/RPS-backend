import { Schema, model, Document } from 'mongoose';

interface IMedicine extends Document {
    name: string;
    persian_name: string;
}

const medicineSchema = new Schema<IMedicine>({
    name: { type: String, required: true },
    persian_name: { type: String, required: true }
});

const Medicine = model<IMedicine>('Medicine', medicineSchema);

export { Medicine, IMedicine };