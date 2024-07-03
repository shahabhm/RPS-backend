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

const Parameter = sequelize.define('Paramter', {
    patient_id: {
        type: DataTypes.STRING
    },
    parameter: {
        type: DataTypes.STRING,
    },
    value: {
        type: DataTypes.INTEGER,
    },
    value: {
        type: DataTypes.INTEGER
    },
    created_at: {
        type: DataTypes.TIME
    }
}, {
    primaryKey: true, tableName: 'parameter', createdAt: false, updatedAt: false
});

const ParameterLimit = sequelize.define('ParameterLimit', {
    patient_id: {
        type: DataTypes.STRING, primaryKey: true
    },
    parameter: {
        type: DataTypes.STRING, primaryKey: true
    },
    lower_limit: {
        type: DataTypes.INTEGER
    },
    upper_limit: {
        type: DataTypes.INTEGER
    }
}, {
    primaryKey: false, tableName: 'parameter_limit', createdAt: false, updatedAt: false
});

const Note = sequelize.define('Note', {
    patient_id: {type: DataTypes.STRING},
    note: {type: DataTypes.STRING},
    image: {type: DataTypes.STRING},
    sender_name: {type: DataTypes.STRING},
    note_title: {type: DataTypes.STRING},
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
    prescription: {type: DataTypes.STRING, primaryKey: true},
    dosage: {type: DataTypes.STRING},
    amount: {type: DataTypes.INTEGER}
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

const PushSubscription = sequelize.define('PushSubscription', {
    account_id: {type: DataTypes.INTEGER, unique: true},
    endpoint: {type: DataTypes.TEXT},
    p256dh: {type: DataTypes.TEXT},
    auth: {type: DataTypes.TEXT}
}, {
    primaryKey: true, tableName: 'push_subscription', createdAt: false, updatedAt: false
});

const Credentials = sequelize.define('Credentials', {
    account_id: {type: DataTypes.INTEGER, primaryKey: true},
    username: {type: DataTypes.STRING},
    password: {type: DataTypes.STRING}
}, {
    primaryKey: true, tableName: 'credentials', createdAt: false, updatedAt: false
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
    Parameter,
    Note,
    PatientCondition,
    Patient,
    DoctorPatient,
    Reminder,
    PushSubscription,
    Credentials,
    ParameterLimit,
}