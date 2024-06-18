const {Account, HeartRate, SPO, Location, Temperature} = require('./db')

const signup = function (name, phoneNumber, role) {
    return Account.create({
        name: name,
        phone_number: phoneNumber,
        role: role
    })
}

const record_heart_rate = async function (data) {
    console.log(data)
    const {account_id, heart_rate} = data
    const record = HeartRate.build({
        account_id: account_id,
        heart_rate: heart_rate,
        created_at: new Date()
    });
    try {
        await record.save()
    }catch (err) {
        console.error(err)
    }
}

const get_heart_rate = async function (account_id) {
    try {
        const records = await HeartRate.findAll({
            where: {
                account_id: account_id
            },
            order: ['created_at'],
        })
        return records;
    } catch (err) {
        console.error(err)
    }
}

const record_spo = async function (account_id, spo) {
    const record = SPO.build({
        account_id: account_id,
        spo2: spo,
        created_at: new Date()
    });
    try {
        await record.save()
        return "OK"
    }catch (err) {
        console.error(err)
        return "ERROR"
    }
}

const get_spo = async function (account_id) {
    try {
        const records = await SPO.findAll({
            where: {
                account_id: account_id
            },
            order: ['created_at'],
        })
        return records;
    } catch (err) {
        console.error(err)
    }
}

const send_location = async function (account_id, latitude, longitude) {
    const location = Location.build({
        account_id: account_id,
        latitude: latitude,
        longitude: longitude,
        created_at: new Date()
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
            },
            order: ['created_at'],
        })
        return records;
    } catch (err) {
        console.error(err)
    }
}

const send_temperature = async function (account_id, temperature) {
    const record = Temperature.build({
        account_id: account_id,
        temperature: temperature,
        created_at: new Date()
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
            },
            order: ['created_at'],
        })
        return records;
    } catch (err) {
        console.error(err)
    }

}

module.exports = {signup, record_heart_rate, get_heart_rate, get_spo, record_spo, send_location, get_location,
    get_temperature, send_temperature}