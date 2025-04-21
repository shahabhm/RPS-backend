import {MongoMemoryServer} from 'mongodb-memory-server';
import mongoose from 'mongoose';
import {PatientMedicine, Prescription} from '../../model/Prescription';
import {Notification} from '../../model/Notification';
import {Account} from "../../model/Account";

describe('PatientMedicine.consume', () => {
    let mongoServer: MongoMemoryServer;
    let patientMedicine1;
    let patientMedicine2;
    let prescription;
    let patientAccount;
    const patientId = '1234567890abcdef12345678';
    const doctorId = 'abcdef1234567890abcdef12';
    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        await mongoose.connect(uri, { useUnifiedTopology: true });
        jest.useFakeTimers({
            doNotFake: ['nextTick'], // do not fake nextTick behavior for mongo in memory
        });
    });

    beforeEach(async () => {

        patientMedicine1 = await PatientMedicine.create({
            medicine: 'Paracetamol',
            dosage: '500mg',
            amount: 10,
            unit: 'tablet',
            repeat: 3,
            withFood: 'yes',
            note: 'Take after meals',
            remainingAmount: 10,
            rationTimes: [8, 16, 24]
        });
        patientMedicine2 = await PatientMedicine.create({
            medicine: 'Ibuprofen',
            dosage: '200mg',
            amount: 5,
            unit: 'tablet',
            repeat: 2,
            withFood: 'no',
            note: 'Take before meals',
            remainingAmount: 5,
            rationTimes: [12, 24]
        });
        // create an account for the patient
        patientAccount = await Account.create({name: 'shahab', phone_number: '09156662222', role: 'patient', password: '12345', patient: patientId})
        prescription = await Prescription.createPrescription(patientId, doctorId, [patientMedicine1, patientMedicine2], '');
    });

    afterAll(async () => {
        jest.useRealTimers();
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    afterEach(async () => {
        await mongoose.connection.db.dropDatabase();
    });

    it('should reduce the remainingAmount of the medicine and save the changes', async () => {
        const updatedMedicine = await PatientMedicine.consume(patientMedicine1._id.toString(), 2);

        // Assert: Verify the remainingAmount is reduced
        expect(updatedMedicine.remainingAmount).toBe(8);
    });

    it('should throw an error if the remainingAmount is less than the amount to consume', async () => {
        await expect(PatientMedicine.consume(patientMedicine1._id.toString(), 20)).rejects.toThrow('MEDICINE_NOT_FOUND');
    });

    it('should find the prescriptions of the patient', async () => {
        const temp = await Prescription.getPatientPrescriptions(patientId);
        console.log(temp);
        expect(temp).toBeDefined();
    });

    it('should return the time of the next ration of the medicine if the ration is to arrive soon', async () => {
        const now = new Date();
        now.setHours(7, 0, 0, 0);
        const expectedRationTime = new Date();
        expectedRationTime.setHours(8,0,0,0);
        expect(patientMedicine1.nearestRationTime.toLocaleString()).toEqual(expectedRationTime.toLocaleString());
    });

    it('should return the time of the nearest ration of the medicine if the ration time has not passed a lot', async () => {
        const now = new Date();
        now.setHours(10, 0, 0, 0); // 10 in the morning
        jest.setSystemTime(now);
        const expectedRationTime = new Date();
        expectedRationTime.setHours(8,0,0,0); // one ration is at 8 in the morning and the next one is at 4 in the afternoon. the morning ration is closer
        expect(patientMedicine1.nearestRationTime.toLocaleString()).toEqual(expectedRationTime.toLocaleString());
    });

    it('should return the current medicine rations for a patient', async () => {
        const now = new Date(2025, 10, 10, 10, 0, 0, 0); // 10 in the morning
        jest.setSystemTime(now);
        const patientMedicineRations = await PatientMedicine.getCurrentRations(patientId);
        expect(patientMedicineRations.length).toBeGreaterThan(0);
        expect(patientMedicineRations[0].nearestRationTime).toEqual(new Date(2025, 10, 10, 8, 0, 0, 0));
        expect(patientMedicineRations[1].nearestRationTime).toEqual(new Date(2025, 10, 10, 12, 0, 0, 0));

    });

    it('should create a notification for the patient', async () => {
        const now = new Date(2025, 10, 10, 10, 0, 0, 0); // 10 in the morning
        jest.setSystemTime(now);
        const notifications = await Notification.getUserNotifications(patientAccount._id.toString())
        expect(notifications.filter(notification => notification.type === 'medicine').length).toBeGreaterThan(1);
        console.log(notifications.filter(notification => notification.type === 'medicine'));
    });
});