import {Schema, model, Document, Model} from 'mongoose';
import { PatientMedicineSchema, IPatientMedicine } from './PatientMedicine';

interface IPrescription extends Document {
    patient: string;
    doctor: string;
    medicines: typeof PatientMedicineSchema[];
    note: string;
    created_at: Date;
}

interface IPrescriptionModel extends Model<IPrescription> {
    createPrescription(patient_id: string, doctor_id: string, medicines: IPatientMedicine, note: string): Promise<IPrescription>;
}

const PrescriptionSchema = new Schema<IPrescription>({
    patient: { type: String, required: true },
    doctor: { type: String, required: true },
    medicines: { type: [PatientMedicineSchema], required: true },
    note: { type: String, required: true },
    created_at: { type: Date, required: true, default: Date.now }
});

PrescriptionSchema.statics.createPrescription = async function (patient_id: string, doctor_id: string, medicines: IPatientMedicine, note: string){
    const prescription = new Prescription({patient: patient_id, doctor: doctor_id, medicines, note});
    await prescription.save();
    return prescription;
}

const Prescription = model<IPrescription, IPrescriptionModel>('Prescription', PrescriptionSchema);

export { Prescription, IPrescription, IPrescriptionModel };