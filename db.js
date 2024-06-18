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
    }
}, {
    primaryKey: true, tableName: 'account', createdAt: false, updatedAt: false
});

const HeartRate = sequelize.define('HeartRate', {
    account_id: {
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
    account_id: { type: DataTypes.STRING },
    spo2: { type: DataTypes.INTEGER },
    created_at: { type: DataTypes.TIME }
}, {
    primaryKey: true, tableName: 'spo', createdAt: false, updatedAt: false
});

const Location = sequelize.define('Location', {
    account_id: { type: DataTypes.STRING },
    latitude: { type: DataTypes.DOUBLE },
    longitude: { type: DataTypes.DOUBLE },
    created_at: { type: DataTypes.TIME }
}, {
    primaryKey: true, tableName: 'location', createdAt: false, updatedAt: false
});

const Temperature = sequelize.define('Temperature', {
    account_id: { type: DataTypes.STRING },
    temperature: { type: DataTypes.DOUBLE },
    created_at: { type: DataTypes.TIME }
}, {
    primaryKey: true, tableName: 'temperature', createdAt: false, updatedAt: false
});

const healthCheck = async function () {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

module.exports = {healthCheck, Account, HeartRate, SPO, Location, Temperature}