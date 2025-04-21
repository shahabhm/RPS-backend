import {NextFunction, Response, Router} from 'express';
import {body} from "express-validator";
import {authenticateToken, ICustomRequest, validateAPI} from "../Middlewares";
import {
    getDoctorIntroduction,
    getDoctorPatients,
    getDoctorReservableTimeslots,
    getDoctors,
    registerDoctor,
    reserveTime
} from "../ts_handlers";
import {DOCTORS_SPECIALIZATION} from "../constants"

const router = Router();

router.post('/api/v1/doctor/register',
    body('firstName').isString(),
    body('lastName').isString(),
    body('nationalCode').isString(),
    body('nezamCode').isString(),
    body('specialization'),
    body('province'),
    body('city').isString(),
    body('schedule'),
    validateAPI,
    authenticateToken,
    async (req: ICustomRequest, res: Response, next: NextFunction) => {
        try {
            const {firstName, lastName, nationalCode, nezamCode, specialization, province, city, schedule} = req.body;
            const response = await registerDoctor(req.user.account_id, firstName, lastName, nationalCode, nezamCode, specialization, province, city, schedule);
            res.send(response);
        } catch (err) {
            next(err);
        }
    }
);

router.get('/api/v1/doctor/list',
    async (req: ICustomRequest, res: Response, next: NextFunction) => {
        try {
            const { city, name, specialization } = req.query;
            const response = await getDoctors(city as string, name as string, specialization as string);
            res.send(response);
        } catch (e) {
            next (e);
        }
    }
);

router.post('/api/v1/doctor/specializations_list', async (req: ICustomRequest, res: Response, next: NextFunction) => {
    res.send(DOCTORS_SPECIALIZATION);
});


router.get('/api/v1/doctor/available_times',
    async (req: ICustomRequest, res: Response, next: NextFunction) => {
        try {
            const { doctor_id, date } = req.query;
            const response = await getDoctorReservableTimeslots(doctor_id as string, new Date(date as string));
            res.send(response);
        } catch (err) {
            next(err);
        }
    }
);

// reserve a time slot for a patient.
router.post('/api/v1/doctor/reserve_time',
    authenticateToken,
    async (req: ICustomRequest, res: Response, next: NextFunction) => {
        try {
            const { doctor_id, time } = req.body;
            const response = await reserveTime(doctor_id, req.user.patient_id, new Date(time));
            res.send(response);
        } catch (e) {
            next(e);
        }
    });

// returns the introduction of the doctor.
router.get('/api/v1/doctor/introduction',
    async (req: ICustomRequest, res: Response, next: NextFunction) => {
        try {
            const { doctorId } = req.query;
            const response = await getDoctorIntroduction(doctorId);
            res.send(response);
        } catch (err) {
            next(err);
        }
    });

// returns a list of the patients of the doctor.
router.get('/api/v1/doctor/patients',
    authenticateToken,
    async (req: ICustomRequest, res: Response, next: NextFunction) => {
        try {
            const { page, limit, urgent } = req.query;
            const { doctor_id } = req.user;
            const patients = await getDoctorPatients(doctor_id);
            res.send(patients);
        } catch (err) {
            next(err);
        }
    }
);


export default router;