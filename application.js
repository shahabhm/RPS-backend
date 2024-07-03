const PushNotifications = require("node-pushnotifications");
const {
    Account, Parameter, Note, PatientCondition, Patient, DoctorPatient,
    PatientPrescription, Reminder, PushSubscription, Credentials, ParameterLimit
} = require('./db')

const publicVapidKey = "BDOLcqQ0rm4DNNyx-L8glLEqWkpnIsgzFkpVaJGABBEYmFR9qhdW6Wc9hyQGiyVBa1MUsqwyNAdcBEln0iVObOE";
const privateVapidKey = process.env.PRIVATE_VAPID_KEY;

const cron = require('node-cron');
const {generateAccessToken} = require("./jwt");

cron.schedule('*/10 * * * * *', () => {
    console.log("cronjob running");
    send_notifications();
});

const send_notifications = async function () {
    const reminders = await Reminder.findAll();
    for (let reminder of reminders) {
        const patient = await Patient.findByPk(reminder.patient_id);
        const doctorPatient = await DoctorPatient.findOne({
            where: {
                patient_id: patient.id
            }
        });
        await send_push(doctorPatient.doctor_id, reminder.reminder, 'notification');
    }
    for (let reminder of reminders) {
        reminder.destroy();
    }
}
const get_patient_prescriptions = async function (patient_id) {
    const prescriptions = await PatientPrescription.findAll({
        where: {
            patient_id: patient_id
        }
    });
    return prescriptions;
}

const delete_prescription = async function (patient_id, prescription) {
    try {
        await PatientPrescription.destroy({
            where: {
                patient_id: patient_id,
                prescription: prescription
            }
        });
    } catch (err) {
        console.error(err)
    }

}

const add_prescription = async function (patient_id, prescription, dosage, amount) {
    try {
        const record = PatientPrescription.build({
            patient_id: patient_id,
            prescription: prescription.value,
            dosage: dosage,
            amount: amount
        });
        await record.save()
    } catch (err) {
        console.error(err)
    }
}


const get_patient_overview = async function (patient_id) {
    const patient = await Patient.findByPk(patient_id);
    const conditions = await PatientCondition.findAll({
        where: {
            patient_id: patient_id
        }
    });
    return {patient, conditions};
}

const login = async function (username, password) {
    const credentials = await Credentials.findOne({
        where: {
            username: username,
            password: password
        }
    });
    if (!credentials) {
        return {error: "not found"}
    }
    const account = await Account.findByPk(credentials.account_id);
    if (credentials) {
        return {
            token: generateAccessToken({account_id: credentials.account_id, role: account.role}),
            account_id: credentials.account_id,
            role: account.role,
            name: account.name
        };
    }
}

const signup = async function (username, password, role, name, phone_number) {
    const account = await Account.create({
        name: name, phone_number: phone_number, role: role
    });
    const credentials = await Credentials.create({
        account_id: account.id, username: username, password: password
    });
    return {
        token: generateAccessToken({account_id: credentials.account_id, role: account.role}),
        account_id: credentials.account_id,
        role: account.role
    };
}

const send_parameter = async function (patient_id, parameter, value, date) {
    const record = Parameter.build({
        patient_id: patient_id, parameter: parameter, value: value, created_at: new Date(date)
    });
    try {
        await record.save()
        check_parameter(patient_id, parameter, value);
        return "OK"
    } catch (err) {
        console.error(err)
        return "ERROR"
    }
}

const check_parameter = async function (patient_id, parameter, value) {
    const parameter_limit = await ParameterLimit.findOne({
        where: {
            patient_id: patient_id,
            parameter: parameter
        }
    });
    if (value < parameter_limit?.lower_limit || value > parameter_limit?.upper_limit) {
        const doctors = await DoctorPatient.findAll({
            where: {
                patient_id: patient_id
            }
        });
        for (let doctor of doctors) {
            send_push(doctor.doctor_id, 'parameter out of range', 'test body');
        }
    }
}

const get_patient_parameters = async function (patient_id) {
    try {
        const records = await Parameter.findAll({
            where: {
                patient_id: patient_id
            }, order: ['created_at'],
        })
        const parameter_names = new Set();
        for (let record of records) {
            parameter_names.add(record.parameter);
        }
        return {parameters: [...parameter_names]};
    } catch (err) {
        console.error(err)
    }
}

const get_patient_parameter = async function (patient_id, parameter) {
    try {
        const parameters = await Parameter.findAll({
            where: {
                parameter: parameter,
                patient_id: patient_id,
            }, order: ['created_at'],
        });
        const parameter_limits = await ParameterLimit.findOne(
            {
                where: {
                    parameter: parameter,
                    patient_id: patient_id
                }
            }
        );
        const response = {
            parameters, parameter_limits
        };
        return response;
    } catch (err) {
        console.error(err)
    }
}

const set_parameter_limits = async function (patient_id, parameter, lower_limit, upper_limit) {
    try {
        ParameterLimit.upsert({
            patient_id: patient_id, parameter: parameter, lower_limit: lower_limit, upper_limit: upper_limit
        });
    } catch (e) {
        console.log(e)
    }
}
const add_notes = async function (account_id, patient_id, note, image, note_title) {
    const account = await Account.findByPk(account_id);
    const record = Note.build({
        patient_id: patient_id,
        note: note,
        image: image,
        created_at: new Date(),
        note_title: note_title,
        sender_name: account.name
    });
    try {
        await record.save()
        return {
            status: "OK",
        }
    } catch (err) {
        console.error(err)
        return {
            status: "error"
        }
    }
}

const get_notes = async function (patient_id) {
    try {
        const records = await Note.findAll({
            where: {
                patient_id: patient_id
            }, order: ['created_at'],
        })
        return records;
    } catch (err) {
        console.error(err)
    }
}

const register_patient = async function (user, name, age, height, conditions) {
    const record = Patient.build({
        name: name, age: age, height: height
    });
    try {
        const patient = await record.save();
        const patient_conditions = PatientCondition.build({
            patient_id: patient.id, condition: conditions[0].value
        });
        await patient_conditions.save();
        const doctorPatient = await DoctorPatient.build({
            doctor_id: user.account_id, patient_id: patient.id
        });
        await doctorPatient.save();
        return {
            id: patient.id,
        }
    } catch (err) {
        console.error(err);
    }
}

const get_patients_list = async function (account_id) {
    try {
        const account = await Account.findByPk(account_id);
        let patients = [];
        if (account.role === "DOCTOR") {
            patients = await Patient.findAll();
        } else {
            const records = await DoctorPatient.findAll({
                where: {
                    doctor_id: account_id
                }
            });
            for (let record of records) {
                const patient = await Patient.findByPk(record.patient_id);
                patients.push(patient);
            }
        }
        for (const patient of patients) {
            const conditions = await PatientCondition.findAll({
                where: {
                    patient_id: patient.id
                }
            });
            patient.dataValues.conditions = conditions;
        }
        return patients;
    } catch (err) {
        console.error(err)
    }
}

const delete_note = async function (note_id) {
    try {
        await Note.destroy({
            where: {
                id: note_id
            }
        });
    } catch (err) {
        console.error(err)
    }
}

const add_reminder = async function (patient_id, reminder, date) {
    const record = Reminder.build({
        patient_id: patient_id, reminder: reminder, date: date
    });
    try {
        await record.save();
        return {result: "OK"};
    } catch (err) {
        console.error(err)
    }
}

const get_reminders = async function (patient_id) {
    try {
        const records = await Reminder.findAll({
            where: {
                patient_id: patient_id
            }
        });
        return records;
    } catch (err) {
        console.error(err)
    }
}

const delete_reminder = async function (reminder_id) {
    try {
        await Reminder.destroy({
            where: {
                id: reminder_id
            }
        });
    } catch (err) {
        console.error(err)
    }
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
    signup,
    get_patient_parameter,
    add_notes,
    get_notes,
    register_patient,
    get_patients_list,
    get_patient_overview,
    get_patient_prescriptions,
    add_prescription,
    delete_prescription,
    delete_note,
    add_reminder,
    get_reminders,
    delete_reminder,
    subscribe_push,
    send_push,
    login,
    send_parameter,
    get_patient_parameters,
    set_parameter_limits,
}