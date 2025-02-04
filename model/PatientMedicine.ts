import { Schema, model, Document } from 'mongoose';

interface IPatientMedicine extends Document {
    medicine: string;
    dosage: string;
    amount: number;
    unit: string;
    repeat: number;
    hours: number;
    with_food: string;
    note: string;
}

const PatientMedicineSchema = new Schema<IPatientMedicine>({
    medicine: { type: String, required: true },
    dosage: { type: String, required: true },
    amount: { type: Number, required: true },
    unit: { type: String, required: true },
    repeat: { type: Number, required: true },
    hours: { type: Number, required: true },
    with_food: { type: String, required: true },
    note: { type: String, required: true }
});

const PatientMedicine = model<IPatientMedicine>('PatientMedicine', PatientMedicineSchema);

export { PatientMedicine, PatientMedicineSchema, IPatientMedicine };