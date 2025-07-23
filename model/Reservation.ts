import {Document, model, Model, Schema} from 'mongoose';
import {MEETING_STATUS} from "../constants";

interface IReservation extends Document {
    doctor: Schema.Types.ObjectId;
    patient: Schema.Types.ObjectId;
    time: Date;
    status: string; // BOOKED, IN_PROGRESS, FINISHED
    cancellation_reason: string;
    description: string;
    can_session_start: boolean;
    status_text: string;

    cancel(reason: string): void;

    start(startTime: Date): Promise<IReservation>;

    finish(startTime: Date): Promise<IReservation>;
}

interface IReservationModel extends Model<IReservation> {
    reserveTimeSlot(doctor_id: string, patient_id: string, time: Date, description: string): Promise<IReservation>;

    getReservations(only_active: boolean, doctorId?: string, patientId?: string): Promise<IReservation[]>;

    getValidReservationsForDate(date: Date): Promise<IReservation[]>;
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
        status: 'BOOKED',
        description: description,
    });
    await reservation.save();
    return (await reservation.populate('doctor', 'first_name last_name'));
}

ReservationSchema.statics.getReservations = async function (only_active: boolean, doctorId?: string, patientId?: string) {
    const filter = {};
    if (patientId) {
        filter['patient'] = patientId;
    }
    if (doctorId) {
        filter['doctor'] = doctorId;
    }
    if (only_active) {
        filter['time'] = {$gte: new Date()}
        filter['status'] = {$ne: 'CANCELLED'}
    }
    return Reservation.find(filter)
        .populate({
            path: 'doctor',
            select: 'first_name last_name specialization profile_picture'
        }).populate('patient', 'first_name last_name profile_picture')
};

// returns all reservations for a specific date. Used for notifications.
ReservationSchema.statics.getValidReservationsForDate = async function (date: Date): Promise<IReservation[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return Reservation.find({
        time: {
            $gte: startOfDay,
            $lte: endOfDay
        },
        status: 'BOOKED'
    }).populate('doctor', 'first_name last_name specialization profile_picture');
}

ReservationSchema.methods.cancel = async function (this: IReservation, reason: string): Promise<void> {
    this.status = MEETING_STATUS.CANCELLED.name;
    this.cancellation_reason = reason;
    await this.save();
};

ReservationSchema.methods.start = async function (this: IReservation, startTime: Date): Promise<IReservation> {
    this.status = MEETING_STATUS.IN_PROGRESS.name;
    // TODO: this.startTime = startTime;
    await this.save();
}

ReservationSchema.methods.finish = async function (this: IReservation, startTime: Date): Promise<IReservation> {
    this.status = MEETING_STATUS.FINISHED.name;
    // TODO: this.startTime = startTime;
    await this.save();
}

ReservationSchema.virtual('can_session_start').get(function (): boolean {
    return true;
});

ReservationSchema.virtual('status_text').get(function (): string {
    return MEETING_STATUS[this.status].persian_name;
});

const Reservation = model<IReservation, IReservationModel>('Reservation', ReservationSchema);

export {Reservation, IReservation, IReservationModel};