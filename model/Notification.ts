import {Account} from "./Account";
import {Reservation} from "./Reservation";
import {PatientMedicine} from "./Prescription";

interface INotification {
    title: string,
    body: string,
    accountId: string,
    actionButton: string,
    actionButtonLink: string,
    type: string,
}


export class Notification {

    private static getPatientMeetingNotifications = async (accountId: string, patientId: string): Promise<INotification[]> => {
        const reservations = await Reservation.getReservations(true, null, patientId);
        const notifications = [];
        for (const reservation of reservations) {
            notifications.push({
                title: `وقت ملاقات با ${reservation.doctor.first_name} ${reservation.doctor.last_name}`,
                body: `وقت ملاقات شما با ${reservation.doctor.first_name} ${reservation.doctor.last_name} در تاریخ ${reservation.time.toLocaleString()}`,
                accountId: accountId.toString(),
                actionButton: 'مشاهده',
                actionButtonLink: `/meeting/${reservation._id}`,
                type: 'doctorVisit'
            });
        }
        return notifications;
    }

    private static getDoctorMeetingNotifications = async (accountId: string, doctorId: string): Promise<INotification[]> => {
        const reservations = await Reservation.getReservations(true, doctorId, null);
        const notifications = [];
        for (const reservation of reservations) {
            notifications.push({
                title: `وقت ملاقات با ${reservation.patient.first_name} ${reservation.patient.last_name}`,
                body: `وقت ملاقات شما با ${reservation.patient.first_name} ${reservation.patient.last_name} در تاریخ ${reservation.time.toLocaleString()}`,
                accountId: accountId.toString(),
                actionButton: 'مشاهده',
                actionButtonLink: `/meeting/${reservation._id}`,
                type: 'doctorVisit'
            });
        }
        return notifications;
    }

    private static getPatientMedicineNotifications = async (accountId, patientId): Promise<INotification[]> => {
        const currentRations = await PatientMedicine.getCurrentRations(patientId);
        const notifications = [];
        for (const medicineRation of currentRations) {
            notifications.push({
                title: `مصرف داروی ${medicineRation.medicine}`,
                body: `داروی ${medicineRation.medicine} در ساعت ${medicineRation.nearestRationTime.getHours()} مصرف شود.`,
                accountId: accountId,
                actionButton: '',
                actionButtonLink: ``,
                type: 'medicine'
            });
        }
        return notifications;
    }

    public static getUserNotifications = async (accountId: string): Promise<INotification[]> => {
        const account = await Account.findById(accountId);
        const notifications = [];
        if (account.doctor) {
            notifications.push(...await this.getDoctorMeetingNotifications(account.doctor.toString()));
        }
        if (account.patient) {
            notifications.push(...await this.getPatientMedicineNotifications(accountId, account.patient.toString()))
            notifications.push(...await this.getPatientMeetingNotifications(accountId, account.patient.toString()))
        }
        return notifications;
    }
}