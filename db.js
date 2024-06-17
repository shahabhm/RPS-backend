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
})

const healthCheck = async function () {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

module.exports = {healthCheck, Account, HeartRate}