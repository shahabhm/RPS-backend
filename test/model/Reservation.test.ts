import {Reservation} from '../../model/Reservation';
import {Notification} from "../../model/Notification";
import {MongoMemoryServer} from "mongodb-memory-server";
import mongoose from "mongoose";
import {Account} from "../../model/Account";
import {Doctor} from "../../model/Doctor";

describe('Reservation Test', () => {
    let mongoServer;
    const patient = {_id: 'abcdef1234567890abcdef16', first_name: 'Shahab', last_name: 'hoseini'};
    const doctor = {_id: 'abcdef1234567890abcdef12', first_name: 'Ali', last_name: 'Reza', specialization: 'Cardiologist', session_time: 20, city: 'Tehran', national_code: '0990880099'};
    let patientAccount;
    let doctorAccount;

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
        doctorAccount = await Account.create({name: 'ali reza', phone_number: '09156662222', role: 'doctor', password: '12345', doctor: doctor});
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

    it('should create correct notifications for meetings for patients', async () => {
        const now = new Date(2025, 10, 10, 10, 0, 0, 0); // 10 in the morning
        jest.setSystemTime(now);
        const reservation = await Reservation.reserveTimeSlot(doctor._id, patient._id, new Date(2025, 10, 10, 12, 0, 0, 0), 'test');
        await Doctor.create(doctor);
        const notifications = await Notification.getUserNotifications(patientAccount._id);
        expect((notifications.filter(notification => notification.type === 'doctorVisit')).length).toBeGreaterThan(0);
        console.log(notifications.filter(notification => notification.type === 'doctorVisit'));
    });

    it('should create correct notifications for mettings for doctors', async () => {
        const now = new Date(2025, 10, 10, 10, 0, 0, 0); // 10 in the morning
        jest.setSystemTime(now);
        Reservation.getReservations = jest.fn(() => {
            return [{
                doctor: doctor,
                patient: patient,
                time: new Date(2025, 10, 10, 12, 0, 0, 0),
                status: 'RESERVED',
                cancellation_reason: '',
                description: 'test',
            }]
        });
        const reservation = await Reservation.reserveTimeSlot(doctor._id, patient._id, new Date(2025, 10, 10, 12, 0, 0, 0), 'test');
        const notifications = await Notification.getUserNotifications(doctorAccount._id);
        expect((notifications.filter(notification => notification.type === 'doctorVisit')).length).toBeGreaterThan(0);
        console.log(notifications.filter(notification => notification.type === 'doctorVisit'));
    });
});