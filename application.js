const {Account, HeartRate} = require('./db')

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

module.exports = {signup, record_heart_rate}