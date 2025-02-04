import {Schema, model, Document, Model} from 'mongoose';

interface IPatientDoctor extends Document {
    patient: Schema.Types.ObjectId;
    doctor: Schema.Types.ObjectId;
}

interface IPatientDoctorModel extends Model<IPatientDoctor> {
    findDoctorIds(patientId: string): Promise<Schema.Types.ObjectId[]>;
    addToWatchlist(patientId: string, doctorId: string): Promise<IPatientDoctor>;
}

const PatientDoctorSchema = new Schema<IPatientDoctor>({
    patient: {type: Schema.Types.ObjectId, ref: 'Patient', required: true},
    doctor: {type: Schema.Types.ObjectId, ref: 'Doctor', required: true},
});

// Adds a patient to the ones that the doctor watches over
PatientDoctorSchema.statics.addToWatchlist = async function (patientId: string, doctorId: string): Promise<IPatientDoctor> {
    return PatientDoctor.create({patient: patientId, doctor: doctorId});
}

PatientDoctorSchema.statics.findDoctorIds = async function (patientId: string): Promise<Schema.Types.ObjectId[]> {
    return PatientDoctor.find({patient: patientId}).select('doctor');
}

const PatientDoctor = model<IPatientDoctor, IPatientDoctorModel>('PatientDoctor', PatientDoctorSchema);

export {PatientDoctor, IPatientDoctor};