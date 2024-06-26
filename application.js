const {
    Account, HeartRate, SPO, Location, Temperature, Note, PatientCondition, Patient, DoctorPatient,
    PatientPrescription, Reminder
} = require('./db')


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

const add_prescription = async function (patient_id, prescriptions) {
    for (let prescription of prescriptions) {
        const record = PatientPrescription.build({
            patient_id: patient_id,
            prescription: prescription.value
        });
        try {
            await record.save()
        } catch (err) {
            console.error(err)
        }
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

const signup = function (name, phoneNumber, role) {
    return Account.create({
        name: name, phone_number: phoneNumber, role: role
    })
}

const record_heart_rate = async function (data) {
    const {account_id, heart_rate} = data
    const record = HeartRate.build({
        account_id: account_id, heart_rate: heart_rate, created_at: new Date()
    });
    try {
        await record.save()
    } catch (err) {
        console.error(err)
    }
}

const get_heart_rate = async function (patient_id) {
    try {
        const records = await HeartRate.findAll({
            where: {
                patient_id: patient_id,
            }, order: ['created_at'],
        })
        return records;
    } catch (err) {
        console.error(err)
    }
}

const record_spo = async function (account_id, spo) {
    const record = SPO.build({
        account_id: account_id, spo2: spo, created_at: new Date()
    });
    try {
        await record.save()
        return "OK"
    } catch (err) {
        console.error(err)
        return "ERROR"
    }
}

const get_spo = async function (account_id) {
    try {
        const records = await SPO.findAll({
            where: {
                account_id: account_id
            }, order: ['created_at'],
        })
        return records;
    } catch (err) {
        console.error(err)
    }
}

const send_location = async function (account_id, latitude, longitude) {
    const location = Location.build({
        account_id: account_id, latitude: latitude, longitude: longitude, created_at: new Date()
    });
    try {
        await location.save()
        return "OK"
    } catch (err) {
        console.error(err);
        return "ERROR"
    }
}

const get_location = async function (account_id) {
    try {
        const records = await Location.findAll({
            where: {
                account_id: account_id
            }, order: ['created_at'],
        })
        return records;
    } catch (err) {
        console.error(err)
    }
}

const send_temperature = async function (account_id, temperature) {
    const record = Temperature.build({
        account_id: account_id, temperature: temperature, created_at: new Date()
    });
    try {
        await record.save()
        return "OK"
    } catch (err) {
        console.error(err)
        return "ERROR"
    }
}

const get_temperature = async function (account_id) {
    try {
        const records = await Temperature.findAll({
            where: {
                account_id: account_id
            }, order: ['created_at'],
        })
        return records;
    } catch (err) {
        console.error(err)
    }
}

const add_notes = async function (patient_id, note, image) {
    const record = Note.build({
        patient_id: patient_id, note: note, picture: image, created_at: new Date()
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
    } catch (err) {
        console.error(err);
    }
}

const get_patients_list = async function (account_id) {
    try {
        const records = await DoctorPatient.findAll({
            where: {
                doctor_id: account_id
            }
        });
        const patients = [];
        for (let record of records) {
            const patient = await Patient.findByPk(record.patient_id);
            patients.push(patient);
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

module.exports = {
    signup,
    record_heart_rate,
    get_heart_rate,
    get_spo,
    record_spo,
    send_location,
    get_location,
    get_temperature,
    send_temperature,
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
    delete_reminder
}