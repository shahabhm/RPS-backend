import {Document, model, Model, Schema} from 'mongoose';


interface IPatientMedicine extends Document {
    medicine: string; // name of the medicine, e.g. Paracetamol
    dosage: string; // the dosage of the medicine, e.g. 5 mg
    amount: number; // the total amount of medicine to be consumed, e.g. 60
    unit: string; // the unit of sale for the medicine, e.g. tablet, ml
    rationTimes: number[]; // the times in the day when the medicine is to be consumed, e.g. [12, 24]
    withFood: string; // whether the drug is to be consumed with food or not, either 'withFood', 'withoutFood', or 'any'
    note?: string; // any note that the doctor has attached
    remainingAmount: number; // how many rations are remaining - decreased every time the medicine is to be consumed by patient, e.g. 54
    nearestRationTime?: Date; // when is the nearest time the med is to be consumed
}

interface IPatientMedicineModel extends Model<IPatientMedicine> {
    // This method is called whenever a ration of the medicine is to be used (called by the cronjob)
    consume(medicine_id: string, amount: number): Promise<IPatientMedicine>;

    getMedicines(patientId: string): Promise<IPatientMedicine[]>;

    // get the nearest rations of the medicines that the patient is to consume
    getCurrentRations(patientId: string): Promise<IPatientMedicine[]>;
}

const PatientMedicineSchema = new Schema<IPatientMedicine>({
    medicine: { type: String, required: true },
    dosage: { type: String, required: true },
    amount: { type: Number, required: true },
    unit: { type: String, required: true },
    rationTimes: {type: [Number], required: true},
    withFood: { type: String, required: true },
    note: { type: String, required: false },
    remainingAmount: {type: Number, required: false}
});

PatientMedicineSchema.virtual('nearestRationTime').get(function () {
    const now = new Date();
    const currentHour = now.getHours();
    const nearestHour = this.rationTimes.reduce((prev, curr) => {
        return (Math.abs(curr - currentHour) < Math.abs(prev - currentHour) ? curr : prev);
    });
    const nearestRationTime = new Date(now);
    nearestRationTime.setHours(nearestHour, 0, 0, 0);
    return nearestRationTime;
});


PatientMedicineSchema.statics.getMedicines = async function (patientId: string): Promise<IPatientMedicine[]> {
    return PatientMedicine.find({
        patient: patientId,
        remainingAmount: { $gt: 0 }
    }).lean();
}

PatientMedicineSchema.statics.consume = async function (medicine_id: string, amount: number): Promise<IPatientMedicine> {
    const medicine = await this.findById(medicine_id);
    if (!medicine || medicine.remainingAmount < amount) {
        throw new Error('MEDICINE_NOT_FOUND');
    }
    medicine.remainingAmount -= amount;
    await medicine.save();
    return medicine;
}

// For a given time, what are the medicines that are to be consumed about now?
PatientMedicineSchema.statics.getCurrentRations = async function(patientId: string): Promise<IPatientMedicine[]> {
    const patientPrescriptions = await Prescription.find({patient: patientId}).populate('medicines');
    const medicines = [];
    for (const prescription of patientPrescriptions) {
        const prescriptionMedicines = prescription.medicines.filter(medicine => {
            return medicine.remainingAmount > 0;
        });
        medicines.push(...prescriptionMedicines);
    }
    return medicines;
}

interface IPrescription extends Document {
    patient: string;
    doctor: string;
    medicines: IPatientMedicine[];
    note?: string;
    created_at: Date;
}

interface IPrescriptionModel extends Model<IPrescription> {
    // Creates a prescription
    createPrescription(patient_id: string, doctor_id: string, medicines: IPatientMedicine[], note: string): Promise<IPrescription>;
    // Finds the prescriptions of a patient
    getPatientPrescriptions(patientId): Promise<IPrescription>;
}

const PrescriptionSchema = new Schema<IPrescription>({
    patient: { type: String, required: true },
    doctor: { type: String, required: true },
    medicines: { type: [PatientMedicineSchema], required: true },
    note: { type: String, required: false },
    created_at: { type: Date, required: true, default: Date.now }
});

PrescriptionSchema.statics.createPrescription = async function (patientId: string, doctorId: string, medicines: IPatientMedicine, note: string){
    const prescription = new Prescription({patient: patientId, doctor: doctorId, medicines, note});
    await prescription.save();
    return prescription;
}

// getPatientPrescriptions
PrescriptionSchema.statics.getPatientPrescriptions = async function (patientId: string) : Promise<IPrescription> {
    return Prescription.find({patient: patientId}).populate('medicines').lean();
}

const PatientMedicine = model<IPatientMedicine, IPatientMedicineModel>('PatientMedicine', PatientMedicineSchema);

const Prescription = model<IPrescription, IPrescriptionModel>('Prescription', PrescriptionSchema);

export { PatientMedicine, PatientMedicineSchema, IPatientMedicine, IPatientMedicineModel, Prescription, IPrescription, IPrescriptionModel};