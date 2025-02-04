import { Schema, model, Document } from 'mongoose';

interface IBriefing extends Document {
    patient: string;
    doctor: string;
    description: string;
}

const BriefingSchema = new Schema<IBriefing>({
    patient: { type: String, required: true },
    doctor: { type: String, required: true },
    description: { type: String, required: true }
});

const Briefing = model<IBriefing>('Briefing', BriefingSchema);

export { Briefing, IBriefing };