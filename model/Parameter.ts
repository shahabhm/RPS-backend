import {Document, Model, model, Schema} from 'mongoose';

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
}

const ParameterSchema = new Schema<IParameter>({
    patient: {type: String, required: true},
    parameter: {type: String, required: true},
    value: {type: Number, required: true},
    created_at: {type: Date, required: true}
});

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

const Parameter = model<IParameter, IParameterModel>('Parameter', ParameterSchema);

export {Parameter, IParameter};