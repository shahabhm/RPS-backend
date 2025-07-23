import {Document, model, Model, Schema} from 'mongoose';

interface IBriefing extends Document {
    patient: Schema.Types.ObjectId; // ID of the patient
    doctor: Schema.Types.ObjectId; // ID of the doctor
    description: string; // description of the status of the patient
    createdAt?: Date; // date of creation
}

interface IBriefingModel extends Model<IBriefing> {
    submitBriefing(description: string, patient: string, doctor: string): Promise<IBriefing>;
    getPatientBriefings(patientId: string): Promise<IBriefing[]>;
    getBriefing(briefingId: string): Promise<IBriefing>;
}

const BriefingSchema = new Schema<IBriefing>({
    patient: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctor: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true },
    description: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

BriefingSchema.statics.submitBriefing = async function (description: string, patient: string, doctor: string): Promise<IBriefing> {
    return Briefing.create({ description, patient, doctor });
}

// getBriefing
BriefingSchema.statics.getBriefing = async function (briefingId: string): Promise<IBriefing> {
    return Briefing.findById(briefingId)
        .populate('doctor', 'first_name last_name')
        .populate('patient', 'first_name last_name');
}

BriefingSchema.statics.getPatientBriefings = async function (patientId: string): Promise<IBriefing[]> {

    const result = await Briefing.find({ patient: patientId })
        .populate('doctor', 'first_name last_name')
        .sort({ createdAt: -1 })
        .lean();
    console.log(result);
    return result;}

const Briefing = model<IBriefing, IBriefingModel>('Briefing', BriefingSchema);

export { Briefing, IBriefing };