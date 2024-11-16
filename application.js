const PushNotifications = require("node-pushnotifications");
const {Account, Hospital, Patient, Condition, Medicine, Allergy, PatientMedicine, Briefing, Parameter, Prescription, Doctor, Reservation, Chat, Message, Device} = require("./mongo");
const errors = require('./errors');
const publicVapidKey = "BDOLcqQ0rm4DNNyx-L8glLEqWkpnIsgzFkpVaJGABBEYmFR9qhdW6Wc9hyQGiyVBa1MUsqwyNAdcBEln0iVObOE";
const privateVapidKey = process.env.PRIVATE_VAPID_KEY;

const cron = require('node-cron');
const {generateAccessToken} = require("./jwt");
const {PATIENT_PARAMETERS} = require("./constants");

cron.schedule('*/10 * * * * *', () => {
    // console.log("cronjob running");
    send_notifications();
});

const generate_token = function (account) {
    return {
        token: generateAccessToken({account_id: account._id, role: account.role}),
        account_id: account.account_id,
        role: account.role,
    };}


const login = async function (phone_number, password) {
    const account = await Account.findOne({phone_number: phone_number, password: password});
    if (!account) {
        throw new Error('USER_NOT_FOUND');
    }
    return generate_token(account);
}

const signup_mobile = async function (phone_number, password) {
    const existing_account = await Account.findOne({phone_number: phone_number});
    if (existing_account) {
        throw new Error('USER_ALREADY_EXISTS');
    }
    const account = new Account({
        phone_number: phone_number,
        password: password,
        role: 'patient',
        otp: '12345'
    });
    await account.save();
    return account;
}

const confirm_otp = async function (phone_number, otp) {
    const account = await Account.findOne({phone_number: phone_number});
    if (!account) {
        throw new Error(errors.USER_NOT_FOUND.error_code);
    }
    if (account.otp !== otp) {
        throw new Error(errors.INVALID_OTP.error_code);
    }
    account.otp = '';
    account.confirmation = true;
    await account.save();
    return generate_token(account);
}

const forget_password = async function(phone_number) {
    const account = await Account.findOne({phone_number: phone_number});
    // user should not find out if the number is registered or not.
    if (!account) return;
    account.otp = '12345';
    await account.save();
    return;
}

const reset_password = async function (account_id, password) {
    const account = await Account.findOne({_id: account_id});
    if (!account) {
        throw new Error(errors.USER_NOT_FOUND.error_code);
    }
    account.password = password;
    await account.save();
}

const register_new = async function (account_id, first_name, last_name, national_code, city, gender, birthdate, weight, height, blood_type) {
    const patient = new Patient({
        first_name,
        last_name,
        national_code,
        city,
        gender,
        birthdate,
        weight,
        height,
        blood_type
    });
    await patient.save();
    const account = await Account.findById(account_id);
    account.patient_id = patient._id;
    account.name = first_name + ' ' + last_name;
    await account.save();
    return patient;
}

const set_condition_description = async function (account_id, condition_description) {
    const account = await Account.findOne({_id: account_id}).populate('patient_id');
    account.patient_id.condition_description = condition_description;
    await account.patient_id.save();
    return;
}

const set_conditions_history = async function (account_id, conditions) {
    const account = await Account.findOne({_id: account_id}).populate('patient_id');
    account.patient_id.condition_history = conditions;
    await account.patient_id.save();
    return;
}

const set_family_history = async function (account_id, conditions) {
    const account = await Account.findOne({_id: account_id}).populate('patient_id');
    account.patient_id.family_history = conditions;
    await account.patient_id.save();
    return;
}

const set_medicines = async function (account_id, medicines) {
    const account = await Account.findOne({_id: account_id}).populate('patient_id');
    account.patient_id.medicines = medicines;
    await account.patient_id.save();
    return;
}

const set_allergies = async function (account_id, allergies) {
    const account = await Account.findOne({_id: account_id}).populate('patient_id');
    account.patient_id.allergies = allergies;
    await account.patient_id.save();
    return;
}

const get_patient = async function (account_id) {
    const account = await Account.findOne({_id: account_id}).populate('patient_id');
    return account.patient_id;
}

const get_condition_names = async function () {
    const condition_names = await Condition.find({}, {_id: 0});
    return condition_names;
}

const get_medicines_names = async function () {
    const medicine_names = await Medicine.find({}, {_id: 0});
    return medicine_names;
}

const get_allergies_names = async function () {
    const allergies_names = await Allergy.find({}, {_id: 0});
    return allergies_names;
}

const add_briefing = async function (patient_id, doctor_id, description) {
    const record = new Briefing({
        patient_id: patient_id, doctor_id: doctor_id, description: description
    });
    try {
        await record.save();
        return {result: "OK", record: record};
    } catch (err) {
        console.error(err)
    }
}

const update_briefing = async function (briefing_id, description) {
    const briefing = await Briefing.findOne({_id: briefing_id});
    briefing.description = description;
    await briefing.save();
    return {result: "OK", briefing};
}

const delete_briefing = async function (briefing_id) {
    const briefing = await Briefing.findOneAndDelete({_id: briefing_id});
    return {result: "OK", briefing};
}

const get_parameter_names = async function() {
    return PATIENT_PARAMETERS;
}

const capture_parameter = async function (device_code, parameter, value) {
    const device = await Device.findOne({code: device_code});
    const record = new Parameter({
        patient_id: device.patient_id, parameter: parameter, value: value, created_at: new Date()
    });
    try {
        await record.save();
        return {result: "OK", record};
    } catch (err) {
        console.error(err)
    }
}

const register_device = async function (account_id, device_code) {
    await Device.findOneAndUpdate({code: device_code}, {patient_id: account_id}, {upsert: true});
    return {result: "OK"};
}

const get_parameters = async function (patient_id) {
    const parameters = await Parameter.find({
        patient_id: patient_id
    });
    return parameters;
}

const add_prescription = async function (patient_id, doctor_id, medicines, note){
    const prescription = new Prescription({patient_id, doctor_id, medicines, note});
    await prescription.save();
    return prescription;
}

const add_patient_medicine = async function (patient_id, medicineName, dosage, amount, repeatCount, unit, description, with_food) {
    const record = new PatientMedicine({
        patient_id, medicineName, dosage, amount, unit, repeat: repeatCount, with_food, notes: description
    });
    try {
        await record.save();
        return {result: "OK", record: record};
    } catch (err) {
        console.error(err);
    }
}

const get_hospitals = async function (city, latitude, longitude) {
    const hospitals = await Hospital.find({city: city});
    return hospitals;
}

const get_patient_medicines = async function (patient_id) {
    const medicines = await PatientMedicine.find({
        where: {
            patient_id: patient_id
        }
    });
    return medicines;
}

const edit_patient_medicine = async function (medicine_id, medicine, dosage, amount, unit, repeat, hours, with_food, notes) {
    const record = await PatientMedicine.findByPk(medicine_id);
    record.medicine = medicine;
    record.dosage = dosage;
    record.amount = amount;
    record.unit = unit;
    record.repeat = repeat;
    record.hours = hours;
    record.with_food = with_food;
    record.notes = notes;
    await record.save();
    return {result: "OK"};
}

const remove_patient_medicine = async function (medicine_id) {
    const record = await PatientMedicine.findByPk(medicine_id);

}

const get_doctors = async function (city, name, specialization) {
    const filter = {};
    if (city) filter.city = city;
    if (name) {
        filter.$or = [{first_name: {$regex: name, $options: 'i'}}, {last_name: {$regex: name, $options: 'i'}}];
    }
    if (specialization) filter.specialization = specialization;

    const doctors = await Doctor.find(filter, {national_code: 0});
    return doctors;
}

const get_doctor_introduction = async function (doctor_id) {
    const doctor = await Doctor.findById(doctor_id);
    return doctor;
}

const register_doctor = async function (account_id, firstName, lastName, nationalCode, nezamCode, specialization, province, city, schedule) {
    const doctor = new Doctor({
        first_name: firstName,
        last_name: lastName,
        national_code: nationalCode,
        nezam_code: nezamCode,
        specialization: specialization,
        province: province,
        city: city,
        schedule: schedule
    });
    await doctor.save();
    const account = await Account.findById(account_id);
    account.doctor_id = doctor._id;
    account.name = firstName + ' ' + lastName;
    await account.save();
    return doctor;
}

const set_doctor_schedule = async function (doctor_id, schedule) {
    const doctor = await Doctor.findById(doctor_id);
    doctor.schedule = schedule.map((s, index) => {
        return {start_hour: s.startHour,
             end_hour: s.endHour,
              day_of_week: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][index]
            }
    });
}

const get_available_times = async function (doctor_id, date) {
    const doctor = await Doctor.findById(doctor_id);
    const active_doctor_reservations = await Reservation.find({doctor_id: doctor_id, date: date});
    const day_of_week = new Date(date).getDay();
    const day_name = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day_of_week];
    const schedule = doctor.schedule.find(s => s.day_of_week === day_name);
    if (!schedule) throw new Error(errors.INVALID_WORKING_DAY.error_code);
    const available_times = [];
    for (let hour = schedule.start_hour; hour < schedule.end_hour; hour++) {
        for (let minute = 0; minute < 60; minute += doctor.session_time) {
            if (active_doctor_reservations.find(r => r.time_slot === `${hour < 10 ? '0' : ''}${hour}:${minute < 10 ? '0' : ''}${minute}`)) {
                continue;
            }
            available_times.push(`${hour < 10 ? '0' : ''}${hour}:${minute < 10 ? '0' : ''}${minute}`);
        }
    }
    return available_times;
}

const reserve_time = async function (patient_account_id, doctor_id, date, time_slot) {
    const doctor = await Doctor.findById(doctor_id);
    const account = await Account.findOne({_id: patient_account_id});
    const active_doctor_reservations = await Reservation.find({doctor_id: doctor_id, date: date, time_slot: time_slot});
    if (active_doctor_reservations.length > 0) {
        throw new Error('TIME_SLOT_NOT_AVAILABLE');
    }
    const day_of_week = new Date(date).getDay();
    const day_name = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day_of_week];
    const schedule = doctor.schedule.find(s => s.day_of_week === day_name);
    if (!schedule) throw new Error(errors.INVALID_WORKING_DAY.error_code);
    const [hour, minute] = time_slot.split(':').map(Number);
    if (hour < schedule.start_hour || hour >= schedule.end_hour) {
        throw new Error('INVALID_TIME_SLOT');
    }
    if (minute % doctor.session_time !== 0) {
        throw new Error('INVALID_TIME_SLOT');
    }
    const reservation = new Reservation({patient_id: account.patient_id, doctor_id, date, time_slot, cancelled: false});
    await reservation.save();
    await reservation.populate({
        path: 'doctor_id',
        select: 'first_name last_name specialization profile_picture',
        as: 'doctor'
    });
    return reservation;
}

const get_reservations = async function (account_id, only_active) {
    const account = await Account.findOne({_id: account_id});
    let filter = {patient_id: account.patient_id};
    if (only_active) {
        filter = {...filter, date: { $gte: new Date() }, cancelled: false}
    }
    const reservations = await Reservation.find(filter)
        .populate({
            path: 'doctor_id',
            select: 'first_name last_name specialization profile_picture',
            as: 'doctor'
        });
    return reservations;
}

const create_chat = async function (account_id1, account_id2) {
    // account 2 is doctor
    if (!account_id2) throw new Error(errors.USER_NOT_FOUND.error_code);
    account2 = await Account.findOne({doctor_id: account_id2});
    if (!account2) {
        throw new Error(errors.USER_NOT_FOUND.error_code);
    }
    // Check if a chat already exists between the two users
    let chat = await Chat.findOne({
        $or: [
            { user1: account_id1, user2: account2._id },
            { user1: account2._id, user2: account_id1 }
        ]
    });

    // If a chat exists, return it
    if (chat) {
        return chat;
    }

    // If no chat exists, create a new chat
    chat = new Chat({ user1: account_id1, user2: account2._id });
    await chat.save();
    return chat;
}

// TODO: move to utils
function truncateString(str, num) {
    if (str.length > num) {
        return str.slice(0, num) + '...';
    } else {
        return str;
    }
}

const get_chat_list = async function (account_id) {
    const chats = await Chat.find({
        $or: [
            { user1: account_id },
            { user2: account_id }
        ]
    }).populate('user1', 'name').populate('user2', 'name');

    const chatListWithDetails = await Promise.all(chats.map(async (chat) => {
        const otherUser = chat.user1._id.equals(account_id) ? chat.user2 : chat.user1;
        const unread = await Message.countDocuments({
            chat: chat._id,
            sender: { $ne: account_id },
            seen: false
        });
        const lastMessage = await Message.findOne({ chat: chat._id }).sort('-createdAt');
        return {
            ...chat.toObject(),
            unread,
            user: {
                profile_picture: 'sina.png',
                name: otherUser.name,
            },
            last_message: {
                preview: lastMessage ? truncateString(lastMessage.text, 40) : null,
                time: lastMessage ? lastMessage.createdAt : null
            }
        };
    }));

    return chatListWithDetails;
}

// TODO: this is really ugly. must clean this thing and move socket to a better place.
const send_message = async function (sender_id, chat_id, text, image_name) {
    if (!image_name && ! text) {
        throw new Error('پیام خالی است.');
    }
    const chat = await Chat.findOne({_id: chat_id});
    const message = new Message({ sender: sender_id, chat: chat_id, text, image_name:image_name });
    await message.save();
    return {message, chat};
}

const get_messages = async function (chat_id, account_id) {
    await Message.updateMany(
        { chat: chat_id, sender: { $ne: account_id }, seen: false },
        { $set: { seen: true } }
    );
    const messages = await Message.find({ chat: chat_id }).sort('createdAt');
    return messages;
}

const seen_message = async function (user_id, message_id) {
    await Message.updateOne({ _id: message_id }, { seen: true });
    return 'ok';
}

const subscribe_push = async function (account_id, subscription) {
    await PushSubscription.upsert({
        account_id: account_id,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth
    }).catch(err => {
        console.error(err);
    });
}

const send_push = async function (account_id, title, body) {
    try {
        const subscription = await PushSubscription.findOne({
            where: {
                account_id: account_id
            }
        });
        if (!subscription) {
            return;
        }
        const subscription_object = {
            endpoint: subscription.endpoint,
            keys: {
                p256dh: subscription.p256dh,
                auth: subscription.auth
            }
        }
        const settings = {
            web: {
                vapidDetails: {
                    subject: "mailto:s.hosseini306@gmail.com",
                    publicKey: publicVapidKey,
                    privateKey: privateVapidKey,
                },
                gcmAPIKey: "gcmkey",
                TTL: 2419200,
                contentEncoding: "aes128gcm",
                headers: {},
            },
            isAlwaysUseFCM: false,
        };
        const push = new PushNotifications(settings);
        const payload = {
            title: title,
            body: body
        };
        await push.send(subscription_object, payload, (err, result) => {
            if (err) {
                console.log(err);
            } else {
                console.log(result);
            }
        });
    } catch (err) {
        console.error(err)
    }
}
module.exports = {
    subscribe_push,
    send_push,
    login,
    signup_mobile,
    confirm_otp,
    forget_password,
    reset_password,
    register_new,
    get_condition_names,
    get_medicines_names,
    get_allergies_names,
    add_briefing,
    update_briefing,
    delete_briefing,
    capture_parameter,
    get_parameters,
    get_parameter_names,
    add_prescription,
    get_hospitals,
    get_doctors,
    get_available_times,
    get_doctor_introduction,
    reserve_time,
    get_reservations,
    set_condition_description,
    set_conditions_history,
    set_family_history,
    set_medicines,
    set_allergies,
    get_patient,
    add_patient_medicine,
    register_doctor,
    set_doctor_schedule,
    create_chat,
    send_message,
    get_messages,
    get_chat_list,
    seen_message,
    register_device,
}