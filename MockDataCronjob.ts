import cron from 'node-cron';
import {captureParameter} from "./ts_handlers";

interface MockParameter {
    name: string;
    min: number;
    max: number;
    variation: number;
}

interface PatientLastMockParameter {
    device: string;
    parameter: string;
    value: number;
}

const devicesToSendMockData: string[] = ['1234'];

const mockParametersData: MockParameter[] = [
    {
        name: 'blood pressure',
        min: 8,
        max: 12,
        variation: 0.1,
    },
    {
        name: 'temperature',
        min: 36,
        max: 40,
        variation: 0.2,
    },
    {
        name: 'heart rate',
        min: 60,
        max: 100,
        variation: 4,
    },
    {
        name: 'oxygen saturation',
        min: 80,
        max: 100,
        variation: 1,
    },
    {
        name: 'blood sugar',
        min: 40,
        max: 200,
        variation: 20,
    },
];

const patientLastMockParameters: PatientLastMockParameter[] = [];

cron.schedule('*/30 * * * * *', async () => {
    console.log('cronjob running');
    for (const parameter of mockParametersData) {
        for (const device of devicesToSendMockData) {
            const lastValue = patientLastMockParameters.find(
                (x) => x.device === device && x.parameter === parameter.name
            );

            const value = lastValue
                ? lastValue.value + (Math.random() - 0.5) * parameter.variation
                : Math.random() * (parameter.max - parameter.min) + parameter.min;

            captureParameter('1234', parameter.name, value.toFixed(2), new Date());

            if (lastValue) {
                lastValue.value = value;
            } else {
                patientLastMockParameters.push({
                    device,
                    parameter: parameter.name,
                    value,
                });
            }
        }
    }
});