import {body} from "express-validator";
import {authenticateToken, ICustomRequest, validateAPI} from "../Middlewares";
import {NextFunction, Response, Router} from "express";

const router = Router();

router.post('/api/v1/doctor/add_prescription',
    body('patient_id').notEmpty(),
    body('doctor_id').notEmpty(),
    body('medicines').isArray(),
    body('note').notEmpty(),
    validateAPI,
    async (req: ICustomRequest, res: Response, next: NextFunction) => {
        try {
            const { patient_id, doctor_id, medicines, note } = req.body;
            const response = await addPrescription(patient_id, doctor_id, medicines, note);
            res.send(response);
        } catch (e) {
            next (e);
        }
    }
);

// app.get('/api/v1/doctor/meetings',
//      authenticateToken,
//     get_account_by_id,
//     async (req, res) => {
//         const { page, limit } = req.query;
//         console.log(page, limit);
//         const response = await handlers.get_doctor_meetings(req.account.doctor_id.toString());
//         res.send({items: response});
//     });

// returns the list of meetings
router.get('/api/v1/meetings',
    authenticateToken,
    async (req: ICustomRequest, res: Response, next: NextFunction) => {
        const { page, limit } = req.query;
        console.log(page, limit);
        const response = await getDoctorMeetings(req.user.doctor_id.toString());
        res.send({items: response});
    });


export default router;