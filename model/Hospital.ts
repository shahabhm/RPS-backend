import {Document, model, Model, Schema} from 'mongoose';
import {AddressSchema} from './Address';

interface IHospital extends Document {
    name: string;
    city: string;
    phone_number: string;
    address: typeof AddressSchema;
    image_url: string;
}

interface IHospitalModel extends Model<IHospital> {
    getHospitals(city: string, latitude: number, longitude: number): Promise<IHospital[]>;
}

const HospitalSchema = new Schema<IHospital>({
    name: { type: String, required: true },
    city: { type: String, required: true },
    phone_number: { type: String, required: true },
    address: { type: AddressSchema, required: true },
    image_url: { type: String, required: true }
});

// returns the hospital with city and location filters
HospitalSchema.statics.getHospitals = async function (city: string, latitude: number, longitude: number): Promise<IHospital[]> {
    const filter = {}
    if (city) filter['city'] = city;
    if (latitude && longitude) {
        filter['address.latitude'] = { $gte: latitude - 0.1, $lte: latitude + 0.1 };
        filter['address.longitude'] = { $gte: longitude - 0.1, $lte: longitude + 0.1 };
    }
    return Hospital.find(filter);
};

const Hospital = model<IHospital, IHospitalModel>('Hospital', HospitalSchema);

export { Hospital, IHospital };