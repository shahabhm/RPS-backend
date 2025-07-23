import {MongoMemoryServer} from "mongodb-memory-server";
import mongoose from "mongoose";
import {Account} from "../../model/Account";
import {Predictor} from "../../model/Predictor";
import {Patient} from "../../model/Patient";

describe('Reservation Test', () => {
    let mongoServer;
    //gender: Path `gender` is required., city: Path `city` is required., national_code: Path `national_code` is required.
    const patient = {_id: 'abcdef1234567890abcdef16', first_name: 'Shahab', last_name: 'hoseini', condition_description: 'test', blood_type: 'O+', height: 179, weight: 80, birthdate: '1990-01-01', gender: 'Female', city: 'Bojnourd', national_code: '1234567890', phone_number: '09156662222'};
    let patientAccount;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        await mongoose.connect(uri, { useUnifiedTopology: true });
        jest.useFakeTimers({
            doNotFake: ['nextTick'], // do not fake nextTick behavior for mongo in memory
        });
    });

    beforeEach(async () => {
        patientAccount = await Account.create({name: 'shahab hoseini', phone_number: '09156662222', role: 'patient', password: '12345', patient: patient});
    });

    afterAll(async () => {
        jest.useRealTimers();
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    afterEach(async () => {
        await mongoose.connection.db.dropDatabase();
        jest.clearAllMocks();
    });

    it('should return the parameter bounds of the patient successfully', async () => {
        await Patient.create(patient);
        const parameterBounds = await Predictor.getPatientParameterBounds(patient._id, 'heart rate');
        console.log(parameterBounds);
        expect(parameterBounds).toBeDefined();
    });

    it('should return the weight bounds of the patient successfully', async () => {
        await Patient.create(patient);
        const parameterBounds = await Predictor.getPatientParameterBounds(patient, 'weight');
        console.log(parameterBounds);
        expect(parameterBounds).toBeDefined();
    })
});