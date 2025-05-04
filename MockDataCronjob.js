const cron = require('node-cron');
const handlers = require('./application');
const {PATIENT_PARAMETERS} = require('./constants');
const {sendPush} = require('./socket');
const devicesToSendMockData = ['1234'];
const mockParametersData = [
    {
        name: 'blood pressure',
        min: 8,
        max: 12,
        variation: 0.1
    },
    {
        name: 'temperature',
        min: 36,
        max: 40,
        variation: 0.2
    },
    {
        name: 'heart rate',
        min: 60,
        max: 100,
        variation: 4
    },
    {
        name: 'oxygen saturation',
        min: 80,
        max: 100,
        variation: 1
    },
    {
        name: 'blood sugar',
        min: 40,
        max: 200,
        variation: 20
    }
    ];

const patientLastMockParameters = [];
cron.schedule('*/30 * * * * *', async () => {
    console.log("cronjob running");
    for (const parameter of mockParametersData) {
        for (let device of devicesToSendMockData) {
            const lastValue = patientLastMockParameters.find((x) => x.device === device && x.parameter === parameter.name);
            const value = lastValue ? lastValue.value + ((Math.random() - 0.5) * parameter.variation) : Math.random() * (parameter.max - parameter.min) + parameter.min;
            const {socket_payloads} = await handlers.capture_parameter('1234', parameter.name, value.toFixed(2));
            socket_payloads.map((payload) => {
                sendPush(payload.account_id.toString(), 'receiveParameter', payload);
            });

        }
    }
});