import {Document, model, Model, Schema} from 'mongoose';

interface IPatient extends Document {
    first_name: string;
    last_name: string;
    national_code: string;
    city: string;
    gender: string;
    birthdate: Date;
    weight: number;
    height: number;
    blood_type: string;
    condition_description: string;
    condition_history: string[];
    family_history: string[];
    allergies: string[];
    medicines: string[];
    profile_picture?: string;
    accountId?: string;
}

interface IPatientModel extends Model<IPatient> {
    registerNew(
        account_id: string,
        first_name: string,
        last_name: string,
        national_code: string,
        city: string,
        gender: string,
        birthdate: Date,
        weight: number,
        height: number,
        blood_type: string,
        allergies: string[],
        medicines: string[],
        family_history: string[],
        condition_history: string[],
        condition_description: string,
        profile_picture: string
    ): Promise<IPatient>;
}

const PatientSchema = new Schema<IPatient>({
    first_name: {type: String, required: true},
    last_name: {type: String, required: true},
    national_code: {type: String, required: true},
    city: {type: String, required: true},
    gender: {type: String, required: true},
    birthdate: {type: Date, required: true},
    weight: {type: Number, required: true},
    height: {type: Number, required: true},
    blood_type: {type: String, required: true},
    condition_description: {type: String, required: true},
    condition_history: {type: [String], required: true},
    family_history: {type: [String], required: true},
    allergies: {type: [String], required: true},
    medicines: {type: [String], required: true},
    profile_picture: {type: String, required: false},
});


PatientSchema.statics.registerNew = async function (
 first_name: string, last_name: string, national_code: string, city: string, gender: string, birthdate: Date, weight: number, height: number, blood_type: string, allergies: string[], medicines: string[], family_history: string[], condition_history: string[], condition_description: string, profile_picture: string
): Promise<IPatient> {
    const patient = new Patient({
        first_name,
        last_name,
        national_code,
        city,
        gender,
        birthdate,
        weight,
        height,
        blood_type,
        condition_description,
        condition_history,
        family_history,
        allergies,
        medicines,
        profile_picture
    });
    await patient.save();
    return patient;
}


const Patient = model<IPatient, IPatientModel>('Patient', PatientSchema);

export {Patient, PatientSchema, IPatient, IPatientModel};