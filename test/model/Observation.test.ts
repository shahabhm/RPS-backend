import {MongoMemoryServer} from 'mongodb-memory-server';
import mongoose from 'mongoose';
import {Observation} from "../../model/Observation";
import {Patient} from "../../model/Patient";
import {Doctor} from "../../model/Doctor";

describe('Observation', () => {
    let mongoServer: MongoMemoryServer;
    const patient = {
        _id: 'abcdef1234567890abcdef16',
        first_name: 'Shahab',
        last_name: 'hoseini',
        condition_description: 'test',
        blood_type: 'O+',
        height: 190,
        weight: 90,
        birthdate: new Date(),
        gender: 'male',
        city: 'bojnourd',
        national_code: '0000000000'
    }
    const doctor = {
        _id: 'abcdef1234567890abcdef12',
        first_name: 'Ali',
        last_name: 'Reza',
        specialization: 'Cardiologist',
        session_time: 20,
        city: 'Tehran',
        national_code: '0990880099'
    };

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        await mongoose.connect(uri, {useUnifiedTopology: true});
        jest.useFakeTimers({
            doNotFake: ['nextTick'], // do not fake nextTick behavior for mongo in memory
        });
    });

    beforeEach(async () => {
        await Doctor.create(doctor);
        await Patient.create(patient);
        await Observation.addToWatchlist(patient._id, doctor._id);
    });

    afterAll(async () => {
        jest.useRealTimers();
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    afterEach(async () => {
        await mongoose.connection.db.dropDatabase();
    });

    it('should find the patients that a doctor observes', async () => {
        const patients = await Observation.findDoctorPatients('abcdef1234567890abcdef12');
        expect(patients.length).toBeGreaterThan(0);
    });

});