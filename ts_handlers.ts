import {IReservation, Reservation} from "./model/Reservation";
import {Doctor, IDoctor} from "./model/Doctor";
import {Account, IAccount} from "./model/Account";
import {sendSMS} from "./sms";
import {IPatient, Patient} from "./model/Patient";
import {IMessage, Message} from "./model/Message";
import {Chat, IChat} from "./model/Chat";
import {sendPush} from "./socket";
import {IParameter, Parameter} from "./model/Parameter";
import {Device, IDevice} from "./model/Device";
import {Observation} from "./model/Observation";
import {ParameterLimit} from "./model/ParameterLimit";
import {Notification} from "./model/Notification";
import {Telegram} from "./Telegram";
import {generateAccessToken, IRequestUser} from "./Middlewares";
import './mongo';
import {errors} from "./errors";
import {PATIENT_PARAMETERS} from "./constants";
import {Prescription} from "./model/Prescription";

export const test = async function () {
//     test cancel reservation
    const reservation = await Reservation.findOne();
    reservation.cancel('test');
}

// returns the user info and jwt token of the user
export const login = async function (phone_number: string, password: string): Promise<IRequestUser> {
    const account = await Account.findOne({phone_number: phone_number, password: password});
    if (!account) {
        throw new Error(errors.USER_NOT_FOUND.error_code);
    }
    if (process.env.NODE_ENV === 'PRODUCTION') {
        Telegram.sendMessage(account.telegram_id, 'شما وارد حساب کاربری خود شدید.');
    }
    return generateAccessToken({
        account_id: account._id.toString(),
        role: account.role,
        patient_id: account.patient?.toString(),
        doctor_id: account.doctor?.toString()
    });
}

export const signup = async function (phone_number: string, role: string, password: string): Promise<IAccount> {
    return Account.createAccount(phone_number, role, password);
}

export const confirmOTP = async function (phone_number: string, otp: string): Promise<IRequestUser> {
    try {
        const account: IAccount = await Account.confirmOTP(phone_number, otp);
        return generateAccessToken({
            account_id: account._id.toString(),
            role: account.role,
            patient_id: account.patient?.toString(),
            doctor_id: account.doctor?.toString()
        });
    } catch (e) {
        throw new Error(e.message);
    }
}

export const forgotPassword = async function (phone_number: string): Promise<void> {
    try {
        const otp = await Account.forgotPassword(phone_number);
        await sendSMS(phone_number, `Your OTP is ${otp}`);
    } catch (e) {
        // user should not find out if the number is registered or not.
        console.debug(e.message);
    }
}

export const resetPassword = async function (account_id: string, password: string) {
    const account = await Account.findOne({_id: account_id});
    if (!account) {
        throw new Error(errors.USER_NOT_FOUND.error_code);
    }
    await account.updatePassword(password);
}


export const getChatList = async function (account_id: string, unread: boolean): Promise<any> {
    return Chat.getUserChats(account_id, unread);
}

export const registerPatient = async function (
    account_id: string, first_name: string, last_name: string, national_code: string, city: string, gender: string, birthdate: Date, weight: number, height: number, blood_type: string, allergies: string[], medicines: string[], family_history: string[], condition_history: string[], condition_description: string, profile_picture: string
): Promise<IPatient> {
    const patient = await Patient.registerNew(account_id, first_name, last_name, national_code, city, gender, birthdate, weight, height, blood_type, allergies, medicines, family_history, condition_history, condition_description, profile_picture);
    const account = await Account.findById(account_id);
    await account.setPatient(patient);
    return patient;
}

export const getPatientInfo = async function (patientId: string): Promise<IPatient> {
    const response = await Patient.findById(patientId);
    return response;
}


// returns the last value of each parameter of the patient
export const getLastParameters = async function (patientId: string) {
    const latestParameters = await Parameter.aggregate([
        {
            $match: {patient: patientId}
        },
        {
            $sort: {created_at: -1}
        },
        {
            $group: {
                _id: "$parameter",
                latestValue: {$first: "$value"},
                createdAt: {$first: "$created_at"}
            }
        },
        {
            $project: {
                parameter: "$_id",
                latestValue: 1,
                createdAt: 1,
                _id: 0
            }
        }
    ]);

    return latestParameters.map(param => {
        const parameterInfo = PATIENT_PARAMETERS.find(p => p.name === param.parameter);
        return {
            ...param,
            ...parameterInfo
        };
    });

}

export const getParameters = async function (patientId: string, parameterName: string, selectedTime: Date) : Promise<IParameter[]> {
    return Parameter.getParameters(patientId, parameterName, selectedTime, 30);
}


export const registerDoctor = async function (
    account_id: string, firstName: string, lastName: string, nationalCode: string, nezamCode: string, specialization: string, province: string, city: string, schedule: {
        day_of_week: string,
        start_hour: number,
        end_hour: number
    }[]
): Promise<IDoctor> {
    const doctor = await Doctor.registerDoctor(account_id, firstName, lastName, nationalCode, nezamCode, specialization, province, city, schedule);
    const account = await Account.findById(account_id);
    await account.setDoctor(doctor);
    return doctor;
}

export const getDoctors = async function (city: string, name: string, specialization: string): Promise<IDoctor[]> {
    return Doctor.searchDoctors(city, name, specialization);
}

export const getDoctorIntroduction = async function (doctor_id: string): Promise<IDoctor> {
    const doctor = await Doctor.findById(doctor_id);
    if (!doctor) {
        throw new Error(errors.USER_NOT_FOUND.error_code);
    }
    const doctorAccount = await Account.findOne({doctor: doctor._id});
    return {
        ...doctor.toObject(),
        accountId: doctorAccount._id
    };
}

export const getDoctorPatients = async function (doctorId: string): Promise<IPatient[]> {
    const patients = await Observation.findDoctorPatients(doctorId);
    return patients;
}

export const getPatientDoctors = async function (patient_id: string): Promise<IDoctor[]> {
    const patientAccount = await Account.findOne({patient: patient_id});
    if (!patientAccount) {
        throw new Error(errors.USER_NOT_FOUND.error_code);
    }
    const doctors = await Observation.findPatientDoctors(patientAccount._id.toString());
    return doctors;
}

export const createChat = async function (account_ids: string[]): Promise<IChat> {
    return Chat.createChat(account_ids);
}

export const sendMessage = async function (sender_id: string, chat_id: string, text: string, image_name: string): Promise<IMessage> {
    const newMessage = await Message.createMessage(sender_id, chat_id, text, image_name);
    const chat = await Chat.findById(chat_id);
    chat.users.forEach(async user_id => {
            sendPush(user_id.toString(), 'receiveMessage', newMessage);
        }
    );
    return newMessage;
}

export const getChatMessages = async function (chat_id: string, account_id: string): Promise<IMessage[]> {
    return Message.getMessages(chat_id, account_id);
}

export const seen_message = async function (message_id: string): Promise<void> {
    await Message.seenMessage(message_id)
}

export const deleteMessage = async function (message_id: string): Promise<void> {
    const message = await Message.deleteMessage(message_id);
    const chat = await Chat.findById(message.chat);
    chat.users.forEach(async user_id => {
            sendPush(user_id.toString(), 'deleteMessage', {_id: message_id});
        }
    );
}


export const captureParameter = async function (device_code: string, parameter_name: string, value: string, date: Date) {
    console.log(`capturing parameter ${parameter_name} with value ${value} for device ${device_code}`);
    const device: IDevice = await Device.findOne({code: device_code});
    const parameter = await Parameter.create({
        patient: device.patient,
        parameter: parameter_name,
        value: value,
        created_at: date
    });
    const doctorIds = await Observation.findPatientDoctors(device.patient.toString());
    const accountIdPromises = [Account.findOne({patient: device.patient})];
    doctorIds.forEach(id => accountIdPromises.push(Account.findOne({doctor: id})));
    const accounts = await Promise.all(accountIdPromises);
    accounts.forEach(account => {
        if (account) {
            sendPush(account._id.toString(), 'receiveParameter', parameter);
        }
    });
    if (ParameterLimit.isParameterOutOfBounds(parameter)) {
        accounts.forEach(account => {
            if (account.telegram_id) {
                Telegram.sendMessage(account.telegram_id, `Warning: ${parameter_name} is out of bounds. Value: ${value}`);
            }
        });
    }
}

export const getParametersOverview = async function (patientId: string) : Promise<any> {
    return Parameter.getParametersOverview(patientId);
}


export const searchDoctors = async function (city: string, name: string, specialization: string): Promise<IDoctor[]> {
    return Doctor.searchDoctors(city, name, specialization);
}

export const getDoctorReservableTimeslots = async function (doctor_id: string, date: Date): Promise<Date[]> {
    const doctor = await Doctor.findOne({_id: doctor_id});
    const timeTable = doctor.getTimeTable(date);
    const reservations = await Reservation.find({doctor: doctor_id, time: {$gte: date}});
    return timeTable.filter(t => !reservations.find(r => r.time.getTime() === t.getTime()));
}

export const reserveTime = async function (doctor_id: string, patient_id: string, time: Date) {
    const doctor = await Doctor.findOne({_id: doctor_id});
    const timeslots = doctor.getTimeTable(time);
    if (!timeslots.find(t => t.getTime() === time.getTime())) {
        throw new Error('Time is not in doctor timetable');
    }
    const existingReservation = await Reservation.findOne({doctor: doctor_id, time: time});
    if (existingReservation) {
        throw new Error('Time slot is already reserved');
    }
    return Reservation.reserveTimeSlot(doctor_id, patient_id, time, '');
}


export const getUserNotifications = async function (account_id: string) {
    const notifications = await Notification.getUserNotifications(account_id);
    const urgentNotifications = notifications.filter(notification => notification.type === 'criticalAlert');
    const normalNotifications = notifications.filter(notification => notification.type !== 'criticalAlert');
    return {
        urgentReminders: urgentNotifications,
        currentReminders: normalNotifications
    }
}

export const sendAppNotification = async function (account_id: string, title: string, body: string, type: string, actionButton: string, actionButtonLink: string, expiryDate: Date) {
    await Notification.createNotification(title, body, account_id, type, actionButton, actionButtonLink, expiryDate);
}

// get the list of meetings
export const getMeetings = async function (patientId: string, doctorId: string) {
    const filter = {};
    if (patientId) {
        filter['patient'] = patientId;
    }
    if (doctorId) {
        filter['doctor'] = doctorId;
    }
    const meetings = await Reservation.find(filter).populate('doctor', 'first_name last_name specialization profile_picture').populate('patient', 'first_name last_name profile_picture');
    return meetings;
}

// get the details of a meeting
export const getMeeting = async function (meetingId: string) {
    const meeting = await Reservation.findById(meetingId).populate('doctor', 'first_name last_name specialization profile_picture').populate('patient', 'first_name last_name profile_picture');
    return meeting;
}

export const addPrescription = async function (meetingId: string, medicines: string[], note: string) {
    const meeting = await Reservation.findById(meetingId) as IReservation;
    if (!meeting) {
        throw new Error(errors.MEETING_NOT_FOUND.error_code);
    }
    const prescription = await Prescription.createPrescription(meeting.patient, meeting.doctor, medicines, note);
    return prescription;
}

export const startMeeting = async function (meetingId: string) {
    const meeting = await Reservation.findById(meetingId);
    if (!meeting) throw new Error(errors.MEETING_NOT_FOUND.error_code);
    await meeting.start(new Date());
    return meeting;
}

export const finishMeeting = async function (meetingId: string) {
    const meeting = await Reservation.findById(meetingId);
    if (!meeting) throw new Error(errors.MEETING_NOT_FOUND.error_code);
    await meeting.finish(new Date());
    return meeting;
}

const connectTelegramCallback = async function (account_id: string, chat_id: string) {
    // called when a user starts the telegram bot. it will link their telegram id to their account.
    // TODO: use some sort of token instead of account id for this function.
    await Account.connectTelegram(account_id, chat_id);
}

Telegram.startBot({startCallback: connectTelegramCallback});

