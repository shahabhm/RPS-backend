import {Response, NextFunction, Router} from 'express';
import {body} from "express-validator";
import {authenticateToken, ICustomRequest, validateAPI} from "../Middlewares";
import {registerDoctor} from "../ts_handlers";
import * as constants from "node:constants";

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
            const response = await getDoctors(city, name, specialization);
            res.send(response);
        } catch (e) {
            next (e);
        }
    }
);

router.post('/api/v1/doctor/specializations_list', async (req: ICustomRequest, res: Response, next: NextFunction) => {
    res.send(constants.DOCTORS_SPECIALIZATION);
});


router.get('/api/v1/doctor/available_times',
    async (req: ICustomRequest, res: Response, next: NextFunction) => {
        try {
            const { doctor_id, date } = req.query;
            const response = await getAvailableTimes(doctor_id, date);
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
            const { doctor_id, date, time_slot } = req.body;
            const response = await reserveTime(req.user.account_id, doctor_id, date, time_slot);
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
            const { account_id } = req.user;
            const patients = await getDoctorPatients(account_id, page, limit, urgent);
            res.send(patients);
        } catch (err) {
            next(err);
        }
    }
);


export default router;