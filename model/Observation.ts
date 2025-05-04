import {Document, model, Model, Schema} from 'mongoose';
import {IPatient} from "./Patient";

/*
Observation is a relation between a patient and a doctor in which the doctor has access to all of the patient's data
and is alerted when the patient goes into a critical condition. Also the patient is free to message the doctor whenever
they feel like it.
 */

interface IObservation extends Document {
    patient: Schema.Types.ObjectId;
    doctor: Schema.Types.ObjectId;
}

interface IObservationModel extends Model<IObservation> {
    findPatientDoctors(patientId: string): Promise<Schema.Types.ObjectId[]>;

    findDoctorPatients(doctorId: string): Promise<IPatient[]>;

    addToWatchlist(patientId: string, doctorId: string): Promise<IObservation>;
}

const ObservationSchema = new Schema<IObservation>({
    patient: {type: Schema.Types.ObjectId, ref: 'Patient', required: true},
    doctor: {type: Schema.Types.ObjectId, ref: 'Doctor', required: true},
});

// Adds a patient to the ones that the doctor watches over
ObservationSchema.statics.addToWatchlist = async function (patientId: string, doctorId: string): Promise<IObservation> {
    return Observation.create({patient: patientId, doctor: doctorId});
}

// finds the list of doctors that observe a patient
ObservationSchema.statics.findPatientDoctors = async function (patientId: string): Promise<Schema.Types.ObjectId[]> {
    return Observation.find({patient: patientId}).select('doctor');
}

// finds the list of the patients that a doctor observes.
ObservationSchema.statics.findDoctorPatients = async function (doctorId: string): Promise<IPatient[]> {
    const doctorObservations = await Observation.find({doctor: doctorId}).select({
        '_id': 0
    }).populate('patient', 'first_name last_name profile_picture');
    return doctorObservations.map((observation) => {console.log(observation.patient); return observation.patient;});
}

const Observation = model<IObservation, IObservationModel>('Observation', ObservationSchema);

export {Observation, IObservation};