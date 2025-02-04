import {Reservation} from "./model/Reservation";
import {Doctor, IDoctor} from "./model/Doctor";
import {Account, IAccount} from "./model/Account";
import {sendSMS} from "./sms";
import {IPatient, Patient} from "./model/Patient";
import {IMessage, Message} from "./model/Message";
import {Chat, IChat} from "./model/Chat";
import {sendNotification} from "./socket";
import {Parameter} from "./model/Parameter";
import {Device, IDevice} from "./model/Device";
import {PatientDoctor} from "./model/PatientDoctor";
import {ParameterLimit} from "./model/ParameterLimit";
import {Telegram} from "./Telegram";
import {generateAccessToken, IRequestUser} from "./Middlewares";
import './mongo';
import {errors} from "./errors";

export const test = async function () {
//     test cancel reservation
    const reservation = await Reservation.findOne();
    reservation.cancel('test');
}

export const login = async function (phone_number: string, password: string): Promise<IRequestUser> {
    const account = await Account.findOne({phone_number: phone_number, password: password});
    if (!account) {
        throw new Error(errors.USER_NOT_FOUND.error_code);
    }
    Telegram.sendMessage(account.telegram_id, 'شما وارد حساب کاربری خود شدید.');
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

export const createChat = async function (account_ids: string[]): Promise<IChat> {
    return Chat.createChat(account_ids);
}

export const sendMessage = async function (sender_id: string, chat_id: string, text: string, image_name: string) {
    const newMessage = await Message.createMessage(sender_id, chat_id, text, image_name);
    const chat = await Chat.findById(chat_id);
    chat.users.forEach(async user_id => {
            sendNotification(user_id.toString(), 'receiveMessage', newMessage);
        }
    );
}

export const getChatMessages = async function (chat_id: string, account_id: string): Promise<IMessage[]> {
    return Message.getMessages(chat_id, account_id);
}

export const seen_message = async function (message_id: string): Promise<void> {
    await Message.seenMessage(message_id)
}


export const captureParameter = async function (device_code: string, parameter_name: string, value: number, date: Date) {
    const device: IDevice = await Device.findOne({code: device_code});
    const parameter = await Parameter.create({
        patient: device.patient,
        parameter: parameter_name,
        value: value,
        created_at: new Date()
    });
    const doctorIds = await PatientDoctor.findDoctorIds(device.patient.toString());
    const accountIdPromises = [Account.findOne({patient: device.patient})];
    doctorIds.forEach(id => accountIdPromises.push(Account.findOne({doctor: id})));
    const accounts = await Promise.all(accountIdPromises);
    accounts.forEach(account => {
        if (account) {
            sendNotification(account._id.toString(), 'receiveParameter', parameter);
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


export const searchDoctors = async function (city: string, name: string, specialization: string): Promise<IDoctor[]> {
    return Doctor.searchDoctors(city, name, specialization);
}

export const getDoctorReservableTimeslots = async function (doctor_id: string, date: Date): Promise<Date[]> {
    const doctor = await Doctor.findOne({_id: doctor_id});
    const timeTable = doctor.getTimeTable(date);
    const reservations = await Reservation.find({doctor: doctor_id, time: {$gte: date}});
    return timeTable.filter(t => !reservations.find(r => r.time.getTime() === t.getTime()));
}

export const reserve_time = async function (doctor_id: string, patient_id: string, time: Date) {
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

const connectTelegramCallback = async function (account_id: string, chat_id: string) {
    // called when a user starts the telegram bot. it will link their telegram id to their account.
    // TODO: use some sort of token instead of account id for this function.
    await Account.connectTelegram(account_id, chat_id);
}

Telegram.startBot({startCallback: connectTelegramCallback});

