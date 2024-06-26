const {Sequelize, DataTypes} = require('sequelize');

const sequelize = new Sequelize('postgres://postgres:example@localhost:5433/postgres') // Example for postgres

const Account = sequelize.define('Account', {
    name: {
        type: Sequelize.STRING, allowNull: false
    },
    phone_number: {
        type: Sequelize.STRING, allowNull: false
    },
    role: {
        type: Sequelize.STRING, allowNull: false,
    },
}, {
    primaryKey: true, tableName: 'account', createdAt: false, updatedAt: false
});

const PatientCondition = sequelize.define('PatientCondition', {
    patient_id: {
        type: DataTypes.STRING
    },
    condition: {
        type: DataTypes.STRING
    }
}, {
    primaryKey: true, tableName: 'patient_condition', createdAt: false, updatedAt: false
})

const HeartRate = sequelize.define('HeartRate', {
    patient_id: {
        type: DataTypes.STRING
    },
    heart_rate: {
        type: DataTypes.INTEGER
    },
    created_at: {
        type: DataTypes.TIME
    }
}, {
    primaryKey: true, tableName: 'heart_rate', createdAt: false, updatedAt: false
});

const SPO = sequelize.define('SPO', {
    patient_id: {type: DataTypes.STRING},
    spo2: {type: DataTypes.INTEGER},
    created_at: {type: DataTypes.TIME}
}, {
    primaryKey: true, tableName: 'spo', createdAt: false, updatedAt: false
});

const Location = sequelize.define('Location', {
    patient_id: {type: DataTypes.STRING},
    latitude: {type: DataTypes.DOUBLE},
    longitude: {type: DataTypes.DOUBLE},
    created_at: {type: DataTypes.TIME}
}, {
    primaryKey: true, tableName: 'location', createdAt: false, updatedAt: false
});

const Temperature = sequelize.define('Temperature', {
    patient_id: {type: DataTypes.STRING},
    temperature: {type: DataTypes.DOUBLE},
    created_at: {type: DataTypes.TIME}
}, {
    primaryKey: true, tableName: 'temperature', createdAt: false, updatedAt: false
});

const Note = sequelize.define('Note', {
    patient_id: {type: DataTypes.STRING},
    note: {type: DataTypes.STRING},
    // picture: { type: DataTypes. },
    created_at: {type: DataTypes.TIME}
}, {
    primaryKey: true, tableName: 'note', createdAt: false, updatedAt: false
});


const Patient = sequelize.define('Patient', {
    age: {type: DataTypes.INTEGER},
    height: {type: DataTypes.INTEGER},
    name: {type: DataTypes.STRING}
}, {
    primaryKey: true, tableName: 'patient', createdAt: false, updatedAt: false
});

const DoctorPatient = sequelize.define('DoctorPatient', {
    doctor_id: {type: DataTypes.INTEGER},
    patient_id: {type: DataTypes.INTEGER}
}, {
    primaryKey: true, tableName: 'doctor_patient', createdAt: false, updatedAt: false
});

const PatientPrescription = sequelize.define('PatientPrescription', {
    patient_id: {type: DataTypes.INTEGER, primaryKey: true},
    prescription: {type: DataTypes.STRING, primaryKey: true}
}, {
    primaryKey: false, tableName: 'patient_prescription', createdAt: false, updatedAt: false
});

const Reminder = sequelize.define('Reminder', {
    patient_id: {type: DataTypes.INTEGER},
    reminder: {type: DataTypes.STRING},
    date: {type: DataTypes.TIME},
    created_at: {type: DataTypes.TIME}
}, {
    primaryKey: true, tableName: 'reminder', createdAt: false, updatedAt: false
});

const healthCheck = async function () {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

module.exports = {
    healthCheck,
    PatientPrescription,
    Account,
    HeartRate,
    SPO,
    Location,
    Temperature,
    Note,
    PatientCondition,
    Patient,
    DoctorPatient,
    Reminder
}