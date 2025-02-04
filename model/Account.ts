import {Schema, model, Document, Model, Types, Mongoose} from 'mongoose';
import {IPatient, Patient} from './Patient';
import {Doctor, IDoctor} from "./Doctor";

export interface IAccount extends Document {
    name?: string;
    phone_number: string;
    role: string;
    password: string;
    otp?: string;
    confirmed: boolean;
    telegram_id?: string
    doctor?: Schema.Types.ObjectId;
    patient?: Schema.Types.ObjectId;

    setPatient(patient: IPatient): Promise<void>;
    getPatient(): Promise<IPatient>;
    setDoctor(doctor: IDoctor): Promise<void>;
    getDoctor(): Promise<IDoctor>;
    updatePassword(newPassword: string): Promise<void>;
}

interface IAccountModel extends Model<IAccount> {
    createAccount(phone_number: string, role: string, password: string): Promise<IAccount>;
    confirmOTP(phone_number: string, otp: string): Promise<IAccount>;
    forgotPassword(phone_number: string): Promise<string>;
    connectTelegram(account_id: string, telegram_id: string): Promise<void>;
}

export const AccountSchema = new Schema<IAccount>({
    name: { type: String, required: false },
    phone_number: { type: String, required: true },
    role: { type: String, required: true },
    password: { type: String, required: true },
    otp: { type: String, required: false },
    telegram_id: { type: String, required: false },
    doctor: { type: Schema.Types.ObjectId, ref: 'Doctor', required: false },
    patient: { type: Schema.Types.ObjectId, ref: 'Patient', required: false },
    confirmed: { type: Boolean, required: true, default: false }
});


AccountSchema.statics.findByPhone = async function (phone_number: string): Promise<IAccount> {
    return Account.findOne({phone_number: phone_number, confirmed: true});
}

AccountSchema.statics.resetPassword = async function (account_id: string, password: string): Promise<void> {
    const account = await Account.findOne({_id: account_id});
    if (!account) {
        throw new Error('USER_NOT_FOUND');
    }
    account.password = password;
    await account.save();
}

AccountSchema.statics.createAccount = async function (phone_number: string, password: string, role: string): Promise<IAccount> {
    const existing_account = await Account.findOne({phone_number: phone_number});
    if (existing_account) {
        throw new Error('USER_ALREADY_EXISTS');
    }
    const account = new Account({
        phone_number: phone_number,
        password: password,
        role: role,
        otp: '12345'
    });
    await account.save();
    return account;
}

AccountSchema.statics.confirmOTP = async function (phone_number: string, otp: string): Promise<IAccount> {
    const account = await Account.findOne({phone_number: phone_number});
    if (!account) {
        throw new Error('USER_NOT_FOUND');
    }
    if (account.otp !== otp) {
        throw new Error('INVALID_OTP');
    }
    account.otp = '';
    account.confirmed = true;
    await account.save();
    return account;
}

AccountSchema.statics.forgotPassword = async function(phone_number: string): Promise<string> {
    const account = await Account.findOne({phone_number: phone_number});
    if (!account) {
        throw new Error('USER_NOT_FOUND');
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    account.otp = otp;
    await account.save();
    return otp;
}

AccountSchema.statics.getFromPatient = async function (patient_id: string): Promise<IPatient> {
    return Account.findOne({patient: patient_id});
}

AccountSchema.statics.getFromDoctor = async function (doctor_id: string): Promise<IDoctor> {
    return Account.findOne({doctor: doctor_id});
}

AccountSchema.statics.connectTelegram = async function (account_id: string, telegram_id: string): Promise<void> {
    const account = await Account.findOne({_id: account_id});
    if (!account) {
        throw new Error('USER_NOT_FOUND');
    }
    account.telegram_id = telegram_id;
    await account.save();
}

AccountSchema.methods.getPatient = async function (this: IAccount): Promise<IPatient> {
    return Patient.findOne({_id: this.patient});
}

AccountSchema.methods.getDoctor = async function (this: IAccount): Promise<IDoctor> {
    return Doctor.findOne({_id: this.doctor});
}

AccountSchema.methods.setPatient = async function (this: IAccount, patient: IPatient): Promise<void> {
    this.patient = patient.id;
    this.name = patient.first_name + ' ' + patient.last_name;
    await this.save();
}

AccountSchema.methods.setDoctor = async function (this: IAccount, doctor: IDoctor): Promise<void> {
    this.doctor = doctor.id;
    this.name = doctor.first_name + ' ' + doctor.last_name;
    await this.save();
}

AccountSchema.methods.updatePassword = async function (this: IAccount, newPassword: string): Promise<void> {
    this.password = newPassword;
    await this.save();
}

export const Account = model<IAccount, IAccountModel>('Account', AccountSchema);