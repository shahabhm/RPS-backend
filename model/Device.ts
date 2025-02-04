import {Schema, model, Document, Model} from 'mongoose';

interface IDevice extends Document {
    patient: Schema.Types.ObjectId;
    code: string;
}

interface IDeviceModel extends Model<IDevice> {
    registerDevice(patient_id: string, device_code: string): Promise<IDevice>;
}

const deviceSchema = new Schema<IDevice>({
    patient: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    code: { type: String, required: true },
});

deviceSchema.statics.registerDevice = async function (patient_id: string, device_code: string): Promise<IDevice> {
    return Device.findOneAndUpdate({code: device_code}, {patient: patient_id}, {upsert: true});
}

const Device = model<IDevice, IDeviceModel>('Device', deviceSchema);

export { Device, IDevice };