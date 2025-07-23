import {IPatient} from "./Patient";

export interface IParameterBounds {
    min?: number; // the minimum number of the bound
    max?: number; // the maximum number of the bound
    color?: string; // a color representation of the bound. This is useful for parameters like BMI, where there are multiple bounds, and not just one
    description?: string; // a description of the bound. This is useful for parameters like BMI, where bounds have names; such as obese and severely obese
}

export class Predictor {

    private static BMIRanges: IParameterBounds[] = [
        {
            max: 18.5,
            color: 'red',
            description: 'کمبود وزن',
        },
        {
            min: 18.5,
            max: 24.9,
            color: 'green',
            description: 'وزن مناسب',
        },
        {
            min: 25,
            max: 29.9,
            color: 'yellow',
            description: 'اضافه وزن',
        },
        {
            min: 30,
            max: 34.9,
            color: 'orange',
            description: 'چاقی مرحله اول',
        },
        {
            min: 35,
            max: 39.9,
            color: 'red',
            description: 'چاقی مرحله دوم',
        },
        {
            min: 40,
            color: 'brown',
            description: 'چاقی مرحله سوم',
        }
    ];
    private static heartRateRanges  = {
        Male: {
            age18to25: {min: 62, max: 73},
            age26to35: {min: 62, max: 73},
            age36to45: {min: 63, max: 75},
            age46to55: {min: 64, max: 76},
            age56to65: {min: 62, max: 75},
            over65: {min: 62, max: 73}
        },
        Female: {
            age18to25: {min: 64, max: 80},
            age26to35: {min: 64, max: 81},
            age36to45: {min: 65, max: 82},
            age46to55: {min: 66, max: 83},
            age56to65: {min: 64, max: 82},
            over65: {min: 64, max: 81}
        },
    }

    /*
     * This function returns the standard resting heart beat rate of a person based on their age and gender
     * @param age: age of the person in years
     * @param gender: the gender of the person, either Male or Female
     * @returns: a list of IParameterBounds objects, each representing a range of heart rate values.
     */
    private static getHeartRateRange = (age: number, gender: string): IParameterBounds[] => {
        let ageGroup;
        if (age >= 18 && age <= 25) {
            ageGroup = 'age18to25';
        } else if (age >= 26 && age <= 35) {
            ageGroup = 'age26to35';
        } else if (age >= 36 && age <= 45) {
            ageGroup = 'age36to45';
        } else if (age >= 46 && age <= 55) {
            ageGroup = 'age46to55';
        } else if (age >= 56 && age <= 65) {
            ageGroup = 'age56to65';
        } else {
            ageGroup = 'over65';
        }
        const standardHeartRateRange = Predictor.heartRateRanges[gender][ageGroup];
        return [{max: standardHeartRateRange.min, color: 'red'}, {...standardHeartRateRange, color: 'green'}, {min: standardHeartRateRange.max, color: 'red'}];
    }

    /**
     * This function calculates the standard weight of the person based on BMI.
     * @param weight The weight of the patient in kg
     * @param height The height of the patient in cm
     * @returns An array of IParameterBounds objects, each representing a range of weight values.
     */
    private static getWeightBounds = (weight: number, height: number): IParameterBounds[] => {
        const BMI = weight / ((height / 100) ** 2);
        const weightRanges : IParameterBounds[] = [];
        for (const range of Predictor.BMIRanges) {
            weightRanges.push({
                ...(range.min !== undefined && { min: parseFloat((range.min * ((height / 100) ** 2)).toFixed(1)) }),
                ...(range.max !== undefined && { max: parseFloat((range.max * ((height / 100) ** 2)).toFixed(1)) }),
                color: range.color,
                description: range.description
            });
        }
        return weightRanges;
    }

    /*
        * This function returns the bounds of a parameter for a patient.
        * @param patientId The id of the patient
        * @param parameter The name of the parameter
        * @returns An array of IParameterBounds objects, each representing a range of values for the parameter.
     */
    public static getPatientParameterBounds = async function (patient: IPatient, parameter: string): Promise<IParameterBounds[]> {
        if (parameter === 'heart rate') {
            return Predictor.getHeartRateRange(20, 'Male');
        }
        if (parameter === 'weight') {
            return Predictor.getWeightBounds(patient.weight, patient.height);
        }
        return [];
    }
}