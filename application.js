const PushNotifications = require("node-pushnotifications");
const {Account, Hospital, Patient, Condition, Medicine, Allergy, PatientMedicine, Briefing, Parameter, Prescription, Doctor, Reservation, Chat, Message, Device,
    ParameterLimit,
    PatientDoctor
} = require("./mongo");
const errors = require('./errors');

const cron = require('node-cron');
const {generateAccessToken} = require("./jwt");
const {PATIENT_PARAMETERS} = require("./constants");
const telegram = require('./telegram');

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

async function get_account_by_id(req, res, next) {
    const {account_id} = req.user;
    if (account_id == null) return res.sendStatus(401)
    req.account = await Account.findOne({_id: req.user.account_id});
    next()
}


const login = async function (phone_number, password) {
    const account = await Account.findOne({phone_number: phone_number, password: password});
    if (!account) {
        throw new Error('USER_NOT_FOUND');
    }
    telegram.send_message(account.telegram_id, 'شما وارد حساب کاربری خود شدید.');
    return generate_token(account);
}

const signup_mobile = async function (phone_number, password, role) {
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
    const current_time = new Date();
    const record = new Parameter({
        patient_id: device.patient_id, parameter: parameter, value: value, created_at: current_time
    });
    // read the parameter limit from the database, if the parameter is not in the acceptable range, send an alert through telegram
    const account = await Account.findOne({patient_id: device.patient_id});
    const patient = await Patient.findOne({_id: device.patient_id});
    const parameter_limit = await ParameterLimit.findOne({patient_id: device.patient_id, parameter_name: parameter});
    if (parameter_limit && (value < parameter_limit.lower_limit || value > parameter_limit.upper_limit)) {
        send_alert(account, parameter, value);
    }
    const patient_doctors = await PatientDoctor.find({patient_id: device.patient_id});
    const doctor_accounts = await Promise.all(patient_doctors.map(async pd => Account.findOne({doctor_id: pd.doctor_id})));
    const patient_payload = {account_id: account._id, parameter: parameter, value: value, created_at: current_time};
    const socket_payloads = doctor_accounts.map((doctor) => {
        return {account_id: doctor._id, parameter: parameter, value: value, created_at: current_time}
    });
    socket_payloads.push(patient_payload);
    try {
        await record.save();
        return {result: "OK", record, socket_payloads};
    } catch (err) {
        console.error(err)
    }
}

const send_alert = async function (patient_account, parameter, value) {
    const patient_doctors = await PatientDoctor.find({patient_id: patient_account._id});
    const doctor_accounts = await Promise.all(patient_doctors.map(async pd => Account.findOne({doctor_id: pd.doctor_id})))
    for (let index = 0; index < doctor_accounts.length; index ++){
        let doctor = doctor_accounts[index];
        telegram.send_message(doctor.telegram_id, `بیمار شما، ${patient_account.name} در شرایط غیرعادی قرار دارد. \n ${parameter}: ${value}\nمشاهده‌ی پروفایل بیمار: http://localhost/${patient_account._id} `);
    }
    telegram.send_message(patient_account.telegram_id, `هشدار: ${parameter} شما ${value} است که خارج از بازه‌ی نرمال است.`);
}

const add_to_watchlist = async function (patient_id, doctor_id){
    const record = new PatientDoctor({patient_id, doctor_id});
    await record.save()
    return record;
}

const register_device = async function (account_id, device_code) {
    await Device.findOneAndUpdate({code: device_code}, {patient_id: account_id}, {upsert: true});
    return {result: "OK"};
}

const get_parameters = async function (patient_id, parameter) {
    const parameters = await Parameter.find({
        patient_id: patient_id,
        parameter: parameter
    }).limit(30).sort({created_at: -1});
    return parameters;
}

const get_parameter_statistics = async function (patient_id, parameter) {
    const currentDate = new Date();
    const oneMonthAgo = new Date(currentDate.setMonth(currentDate.getMonth() - 1));

    const statistics = await Parameter.aggregate([
        {
            $match: {
                patient_id: patient_id,
                parameter: parameter,
                created_at: { $gte: oneMonthAgo }
            }
        },
        {
            $group: {
                _id: "$parameter",
                minValue: { $min: "$value" },
                maxValue: { $max: "$value" },
                avgValue: { $avg: "$value" },
                values: { $push: "$value" }
            }
        },
        {
            $project: {
                parameter: "$_id",
                minValue: 1,
                maxValue: 1,
                avgValue: 1,
                values: 1,
                _id: 0
            }
        }
    ]);

    if (statistics.length === 0) {
        return { parameter: parameter, minValue: null, maxValue: null, avgValue: null, p10: null, p90: null };
    }

    const values = statistics[0].values.sort((a, b) => a - b);
    const p10 = values[Math.floor(values.length * 0.1)];
    const p90 = values[Math.floor(values.length * 0.9)];
    const avgValue = (Math.round( statistics[0].avgValue * 100) / 100).toFixed(0);

    return {
        parameter: parameter,
        minValue: statistics[0].minValue,
        maxValue: statistics[0].maxValue,
        avgValue: avgValue,
        p10: p10,
        p90: p90
    };
}

const get_promotions = async function (account_id) {
    const account = await Account.findOne({ _id: account_id }).populate('patient_id').populate('doctor_id');
    const promotions = [];
    const devices = await Device.find({patient_id: account.patient_id._id});
    if (devices.length === 0) {
        promotions.push({
            title: 'تخفیف ویژه برای تهیه‌ی دستگاه',
            body: 'شما می‌توانید تا ۳ روز آینده دستگاه پایش سلامت را با تخفیف ويژه خریداری کنید.',
            type: 'call',
            actionButton: 'تماس با واحد فروش',
            actionButtonLink: 'tel:09156289830'
        });
    }

    const reservations = await Reservation.find({ patient_id: account.patient_id._id });
    if (account.patient_id && reservations.length === 0) {
        promotions.push({
            title: 'بدون دردسر نوبت ویزیت تهیه کنید!',
            body: 'شما می‌توانید به سرعت و به صورت آنلاین، از پزشکان ما نوبت بگیرید.',
            type: 'tick',
            actionButton: 'جستجو میان پزشکان',
            actionButtonLink: '/user/patient/doctors'
        });
    }

    if (!account.telegram_id) {
        promotions.push({
            title: 'وارد ربات تلگرامی شوید!',
            body: 'با استارت کردن ربات تلگرام، می‌توانید یادآورها و هشدارهای مربوط به خودتان را در تلگرام دریافت کنید.',
            type: 'telegram',
            actionButton: 'وصل شدن به ربات تلگرام',
            actionButtonLink: `https://t.me/test_health_alerts_bot?start=${account_id}`
        });
    }

    return promotions;
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
    const hospitals = await Hospital.find();
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
        schedule: schedule,
        session_time: 15,
    });
    await doctor.save();
    const account = await Account.findById(account_id);
    account.doctor_id = doctor._id;
    account.name = firstName + ' ' + lastName;
    await account.save();
    return doctor;
}

const set_doctor_schedule = async function (account_id, schedule) {
    const account = await Account.findOne({_id: account_id});
    const doctor = await Doctor.findById(account.doctor_id);
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
    // account_id2 could be patient_id or doctor_id
    if (!account_id2) throw new Error(errors.USER_NOT_FOUND.error_code);
    account2 = await Account.findOne({
        $or: [
            { doctor_id: account_id2},
            { patient_id: account_id2 }
        ]
    });
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

// gets the list of chats for a user. unread is a boolean, if true, the function will only return chats with unread messages.
const get_chat_list = async function (account_id, unread) {
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
                preview: lastMessage?.text ? truncateString(lastMessage.text, 40) : lastMessage?.image_name? 'تصویر' : 'پیامی وجود ندارد.',
                time: lastMessage?.createdAt ? lastMessage.createdAt : null
            }
        };
    }));
    const sortedChatList = chatListWithDetails.sort((a, b) => {
        return new Date(b.last_message.time) - new Date(a.last_message.time);
    });

    if (unread) return chatListWithDetails.filter(chat => chat.unread > 0);
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

const get_latest_parameters = async function (patient_id) {
    const latestParameters = await Parameter.aggregate([
        {
            $match: { patient_id: patient_id }
        },
        {
            $sort: { created_at: -1 }
        },
        {
            $group: {
                _id: "$parameter",
                latestValue: { $first: "$value" },
                createdAt: { $first: "$created_at" }
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
        const unit = parameterInfo ? parameterInfo.unit : '';
        return {
            ...param,
            unit: unit
        };
    });
}

const get_doctor_meetings = async function (doctor_id) {
    const reservations = await Reservation.find({ doctor_id: doctor_id })
        .populate('patient_id', 'first_name last_name national_code city gender birthdate weight height blood_type condition_description condition_history family_history allergies medicines profile_picture');
    return reservations;
}

const get_doctor = async function (doctor_id){
    const doctor = await Doctor.findOne({_id: doctor_id});
    return {
        name: `${doctor.first_name} ${doctor.last_name}`
    }
}

const get_hospital_info = async function (hospital_id){
    const hospital = await Hospital.findOne({_id: hospital_id});
    return hospital;
}

const connect_telegram = async function(account_id, telegram_id) {
    // called when a user starts the telegram bot. it will link their telegram id to their account.
    // TODO: use some sort of token instead of account id for this function.
    const account = await Account.findOne({_id: account_id});
    account.telegram_id = telegram_id;
    await account.save();
    return;
}

module.exports = {
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
    get_parameter_extremes: get_parameter_statistics,
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
    get_latest_parameters,
    get_account_by_id,
    get_doctor_meetings,
    get_doctor,
    connect_telegram,
    add_to_watchlist,
    get_hospital_info,
    get_promotions,
}