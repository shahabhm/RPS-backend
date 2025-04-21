import {Document, Model, model, Schema} from 'mongoose';
import {IPatient, PatientSchema} from './Patient';

interface IAddress {
    address: string;
    latitude: number;
    longitude: number;
}

interface ISchedule {
    day_of_week: string;
    start_hour: number;
    end_hour: number;
}

interface IDoctor extends Document {
    first_name: string;
    last_name: string;
    national_code: string; // NID of the doctor, used for verification stuff
    city: string; // in what city does the doctor work? TODO: make this a list, some doctors work in multiple places
    schedule: ISchedule[]; // what days does the doctor accept online sessions through the app
    address?: IAddress; // where does the doctor work? TODO: make this a list
    specialization: string; // e.g. cardiologist
    profile_picture?: string; // profile picture file name
    session_time: number; // how long does each session of the doctor take? (in minutes) e.g. 20
    description?: string; // some short biography or anything notable about the doctor
    patients: IPatient[]; // what patients does the doctor currently observe?

    getTimeTable(date: Date): Date[];
}

interface IDoctorModel extends Model<IDoctor> {
    searchDoctors(city: string, name: string, specialization: string): Promise<IDoctor[]>;

    registerDoctor(
        account_id: string,
        firstName: string,
        lastName: string,
        nationalCode: string,
        nezamCode: string,
        specialization: string,
        province: string,
        city: string,
        schedule: ISchedule[]
    ): Promise<IDoctor>;
}

const ScheduleSchema = new Schema({
    day_of_week: String,
    start_hour: Number,
    end_hour: Number
}, {_id: false});

const AddressSchema = new Schema({
    address: String,
    latitude: Number,
    longitude: Number
}, {_id: false});

const DoctorSchema = new Schema<IDoctor>({
    first_name: {type: String, required: true},
    last_name: {type: String, required: true},
    national_code: {type: String, required: true},
    city: {type: String, required: true},
    schedule: {type: [ScheduleSchema], required: true},
    address: {type: AddressSchema, required: false},
    specialization: {type: String, required: true},
    profile_picture: {type: String, required: false},
    session_time: {type: Number, required: true},
    description: {type: String, required: false},
    patients: {type: [PatientSchema], required: true},
});

// for a given date, find the timeslots available for reservation for the doctor in that date
DoctorSchema.methods.getTimeTable = function (date: Date): Date[] {
    // get name of the week day of date object
    const day = date.toLocaleString('en-US', {weekday: 'long'});
    const schedule = this.schedule.find(s => s.day_of_week === day);
    if (!schedule) return [];
    const start = new Date(date);
    start.setHours(schedule.start_hour);
    start.setMinutes(0);
    start.setSeconds(0);
    start.setMilliseconds(0);
    const end = new Date(date);
    end.setHours(schedule.end_hour);
    end.setMinutes(0);
    end.setSeconds(0);
    end.setMilliseconds(0);
    const timeslots: Date[] = [];
    // generate the timeslots for the day
    for (let i = start; i < end; i.setMinutes(i.getMinutes() + this.session_time)) {
        const time = new Date(i);
        if (time >= date) timeslots.push(time);
    }
    return timeslots;
}

DoctorSchema.statics.searchDoctors = async function (city: string, name: string, specialization: string): Promise<IDoctor[]> {
    const filter = {};
    if (city) filter['city'] = city;
    if (name) {
        filter['$or'] = [{first_name: {$regex: name, $options: 'i'}}, {last_name: {$regex: name, $options: 'i'}}];
    }
    if (specialization) filter['specialization'] = specialization;
    return Doctor.find(filter, {national_code: 0, patients: 0});
}

DoctorSchema.statics.registerDoctor = async function (
    firstName: string,
    lastName: string,
    nationalCode: string,
    nezamCode: string,
    specialization: string,
    province: string,
    city: string,
    schedule: ISchedule[]
): Promise<IDoctor> {
    const doctor = new Doctor({
        first_name: firstName,
        last_name: lastName,
        national_code: nationalCode,
        nezam_code: nezamCode,
        specialization: specialization,
        province: province,
        city: city,
        schedule: schedule,
        session_time: 15,
    });
    return doctor.save();
};

const Doctor = model<IDoctor, IDoctorModel>('Doctor', DoctorSchema);

export {Doctor, IDoctor};