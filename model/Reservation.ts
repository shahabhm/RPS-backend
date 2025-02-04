import {Document, model, Model, Schema} from 'mongoose';

interface IReservation extends Document {
    doctor: Schema.Types.ObjectId;
    patient: Schema.Types.ObjectId;
    time: Date;
    status: string;
    cancellation_reason: string;
    description: string;
    can_session_start: boolean;

    cancel(reason: string): void;
}

interface IReservationModel extends Model<IReservation> {
    reserveTimeSlot(doctor_id: string, patient_id: string, time: Date, description: string): Promise<IReservation>;

    getReservations(account_id: string, only_active: boolean): Promise<IReservation[]>;
}

const opts = {toJSON: {virtuals: true}};

const ReservationSchema = new Schema<IReservation>({
    doctor: {type: Schema.Types.ObjectId, ref: 'Doctor'},
    patient: {type: Schema.Types.ObjectId, ref: 'Patient'},
    time: {type: Date, required: true},
    status: {type: String, required: true},
    cancellation_reason: {type: String, default: ''},
    description: {type: String, default: ''}
}, opts);

ReservationSchema.statics.reserveTimeSlot = async function (doctor_id: string, patient_id: string, time: Date, description: string): Promise<IReservation> {
    const reservation = new Reservation({
        doctor: doctor_id,
        patient: patient_id,
        time: time,
        status: 'RESERVED',
        description: description,
    });
    await reservation.save();
    return reservation;
}

ReservationSchema.statics.getReservations = async function (only_active: boolean, doctor_id?: string, patient_id?: string) {
    const filter = {};
    if (patient_id) { filter['patient'] = patient_id; }
    if (doctor_id) { filter['doctor'] = doctor_id; }
    if (only_active) {
        filter['time'] = {$gte: new Date()}
        filter['cancelled'] = false
    }
    return Reservation.find(filter)
        .populate({
            path: 'doctor',
            select: 'first_name last_name specialization profile_picture'
        })
};

ReservationSchema.methods.cancel = async function (this: IReservation, reason: string): Promise<void> {
    this.status = 'CANCELLED';
    this.cancellation_reason = reason;
    await this.save();
};

ReservationSchema.virtual('can_session_start').get(function (): boolean {
    return true;
});

const Reservation = model<IReservation, IReservationModel>('Reservation', ReservationSchema);

export {Reservation, IReservation, IReservationModel};