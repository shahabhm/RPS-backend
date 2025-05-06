import {Document, Model, model, Schema} from 'mongoose';
import {PATIENT_PARAMETERS} from '../constants';

interface IParameter extends Document {
    patient: string;
    parameter: string;
    value: number;
    created_at: Date;
}

interface IParameterModel extends Model<IParameter> {
    getParameters(patient_id: string, parameter: string, selected_time: Date, timeRange: number): Promise<IParameter[]>;

    getParameterStatistics(patient_id: string, parameter: string): Promise<{
        parameter: string,
        minValue: number,
        maxValue: number,
        avgValue: string,
        p10: number,
        p90: number
    }>;

    getLatestParameters(patient_id: string): Promise<any>;

    getParametersOverview(patientId: string): Promise<AllData[]>;
}

const ParameterSchema = new Schema<IParameter>({
    patient: {type: String, required: true},
    parameter: {type: String, required: true},
    value: {type: Number, required: true},
    created_at: {type: Date, required: true}
});

// returns the values of a specific parameter of a patient at a certain time. timeRange is in minutes
ParameterSchema.statics.getParameters = async function (patient_id: string, parameter: string, selected_time: Date, timeRange: number): Promise<IParameter[]> {
    const rangeStart = new Date(selected_time.getTime() - timeRange * 60 * 1000);
    const rangeEnd = new Date(selected_time.getTime() + timeRange * 60 * 1000);
    return Parameter.find({
        patient: patient_id,
        parameter: parameter,
        created_at: {$gte: rangeStart, $lte: rangeEnd}
    }).sort({created_at: 1});
};

// This function calculates the statistics of a parameter for a patient in the last month.
// The statistics include the minimum, maximum, average, 10th percentile, and 90th percentile of the parameter values.
ParameterSchema.statics.getParameterStatistics = async function (patient_id: string, parameter: string): Promise<{
    parameter: string,
    minValue: number,
    maxValue: number,
    avgValue: string,
    p10: number,
    p90: number
}> {
    const currentDate = new Date();
    const oneMonthAgo = new Date(currentDate.setMonth(currentDate.getMonth() - 1));

    const statistics = await Parameter.aggregate([
        {
            $match: {
                patient: patient_id,
                parameter: parameter,
                created_at: {$gte: oneMonthAgo}
            }
        },
        {
            $group: {
                _id: "$parameter",
                minValue: {$min: "$value"},
                maxValue: {$max: "$value"},
                avgValue: {$avg: "$value"},
                values: {$push: "$value"}
            }
        },
        {
            $project: {
                parameter: "$_id",
                minValue: 1,
                maxValue: 1,
                avgValue: 1,
                values: 1,
                _id: 0
            }
        }
    ]);

    if (statistics.length === 0) {
        return {parameter: parameter, minValue: null, maxValue: null, avgValue: null, p10: null, p90: null};
    }

    const values = statistics[0].values.sort((a, b) => a - b);
    const p10 = values[Math.floor(values.length * 0.1)];
    const p90 = values[Math.floor(values.length * 0.9)];
    const avgValue = (Math.round(statistics[0].avgValue * 100) / 100).toFixed(0);

    return {
        parameter: parameter,
        minValue: statistics[0].minValue,
        maxValue: statistics[0].maxValue,
        avgValue: avgValue,
        p10: p10,
        p90: p90
    };
};

ParameterSchema.statics.getLatestParameters = async function (patient_id: string): Promise<any> {
    const latestParameters = await Parameter.aggregate([
        {
            $match: {patient: patient_id}
        },
        {
            $sort: {created_at: -1}
        },
        {
            $group: {
                _id: "$parameter",
                latestValue: {$first: "$value"},
                createdAt: {$first: "$created_at"}
            }
        },
        {
            $project: {
                parameter: "$_id",
                latestValue: 1,
                createdAt: 1,
                _id: 0
            }
        }
    ]);

    return latestParameters.map(param => {
        const parameterInfo = PATIENT_PARAMETERS.find(p => p.name === param.parameter);
        return {
            ...param,
            ...parameterInfo
        };
    });
};

interface MostRecentValue {
    parameter: string;
    value: number;
    createdAt: Date;
}

interface HourlyExtreme {
    parameter: string;
    year: number;
    month: number;
    day: number;
    hour: number;
    minValue: number | null;
    maxValue: number | null;
}

interface AllData {
    parameter: string;
    parameterName: string;
    unit: string;
    latestValue?: MostRecentValue;
    maxAndMin?: HourlyExtreme[];
}


ParameterSchema.statics.getParametersOverview = async (patientId: string): Promise<AllData[]> => {
    const currentDate = new Date();
    const oneDayAgo = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000);

    const results = await Parameter.aggregate([
        {
            $match: {
                patient: patientId,
            }
        },
        {
            $facet: {
                parametersMostRecentValue: [
                    { $match: { created_at: { $gte: oneDayAgo } } },
                    { $sort: { created_at: -1 } },
                    {
                        $group: {
                            _id: "$parameter",
                            value: { $first: "$value" },
                            createdAt: { $first: "$created_at" }
                        }
                    },
                    {
                        $project: {
                            parameter: "$_id",
                            value: 1,
                            createdAt: 1,
                            _id: 0
                        }
                    }
                ],
                todayParametersHourlyExtremes: [
                    { $match: { created_at: { $gte: oneDayAgo } } },
                    {
                        $group: {
                            _id: {
                                parameter: "$parameter",
                                year: { $year: "$created_at" },
                                month: { $month: "$created_at" },
                                day: { $dayOfMonth: "$created_at" },
                                hour: { $hour: "$created_at" }
                            },
                            minValue: { $min: "$value" },
                            maxValue: { $max: "$value" }
                        }
                    },
                    {
                        $project: {
                            _id: 0,
                            parameter: "$_id.parameter",
                            year: "$_id.year",
                            month: "$_id.month",
                            day: "$_id.day",
                            hour: "$_id.hour",
                            minValue: 1,
                            maxValue: 1
                        }
                    }
                ],
                allAvailableParameters: [
                    { $match: { patient: patientId } },
                    { $group: { _id: "$parameter" } }
                ]
            }
        }
    ]);

    const parametersMostRecentValue: MostRecentValue[] = results[0].parametersMostRecentValue;
    const todayParametersHourlyExtremes: HourlyExtreme[] = results[0].todayParametersHourlyExtremes;
    const allAvailableParameters = results[0].allAvailableParameters;

    const allData: AllData[] = allAvailableParameters.map((parameter: { _id: string }) => {
        const parameterInfo = PATIENT_PARAMETERS.find(p => p.name === parameter._id);
        return {
            parameter: parameter._id,
            parameterName: parameterInfo?.persian_name || '',
            unit: parameterInfo?.unit || ''
        };
    });

    allData.forEach(parameter => {
        const mostRecentValue = parametersMostRecentValue.find(p => p.parameter === parameter.parameter);
        if (mostRecentValue) {
            parameter.latestValue = mostRecentValue;
        }
    });

    const parametersMinimumAndMaximum: Record<string, HourlyExtreme[]> = {};
    todayParametersHourlyExtremes.forEach(extreme => {
        if (!parametersMinimumAndMaximum[extreme.parameter]) {
            parametersMinimumAndMaximum[extreme.parameter] = [];
        }
        parametersMinimumAndMaximum[extreme.parameter].push(extreme);
    });

    const past24Hours = Array.from({ length: 24 }, (_, i) => {
        const tempTime = currentDate.getTime() - i * 60 * 60 * 1000;
        const tempDate = new Date(tempTime);
        return {
            year: tempDate.getFullYear(),
            month: tempDate.getMonth() + 1,
            day: tempDate.getDate(),
            hour: tempDate.getHours(),
        };
    });

    const parametersMinAndMaxWithEmptyHours: Record<string, HourlyExtreme[]> = {};

    for (const parameter in parametersMinimumAndMaximum) {
        const newParameterValues: HourlyExtreme[] = [];
        const parameterValues = parametersMinimumAndMaximum[parameter];
        past24Hours.forEach(hour => {
            const existingParameter = parameterValues.find(p => p.hour === hour.hour);
            if (!existingParameter) {
                newParameterValues.push({
                    parameter: parameter,
                    year: hour.year,
                    month: hour.month,
                    day: hour.day,
                    hour: hour.hour,
                    minValue: null,
                    maxValue: null
                });
            } else {
                newParameterValues.push(existingParameter);
            }
        });
        parametersMinAndMaxWithEmptyHours[parameter] = newParameterValues;
    }

    allData.forEach(parameter => {
        if (parametersMinAndMaxWithEmptyHours[parameter.parameter]) {
            parameter.maxAndMin = parametersMinAndMaxWithEmptyHours[parameter.parameter];
        }
    });

    allData.sort((a, b) => a.parameter.localeCompare(b.parameter));

    return allData;
};

const Parameter = model<IParameter, IParameterModel>('Parameter', ParameterSchema);

export {Parameter, IParameter};