import { Schema, Document } from 'mongoose';

interface IAddress extends Document {
    address: string;
    latitude: number;
    longitude: number;
}

const AddressSchema = new Schema<IAddress>({
    address: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
}, { _id: false });

export { AddressSchema, IAddress };