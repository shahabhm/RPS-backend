import {NextFunction, Response, Router} from 'express';
import {authenticateToken, ICustomRequest} from "../Middlewares";
import {getBriefing, submitBriefing} from "../ts_handlers";
import {USER_ROLES} from "../constants";


const router = Router();

router.post('/api/v1/briefing', authenticateToken, async (req: ICustomRequest, res: Response, next: NextFunction) => {
    try {
        const patientId = req.user.role === USER_ROLES.PATIENT ? req.user.patient_id : req.body.patientId;
        const {description} = req.body;
        const doctorId = req.user.doctor_id;
        const response = await submitBriefing(description, patientId, doctorId);
        res.send(response);
    } catch (err) {
        next(err)
    }
});

// router.get('/api/v1/briefing', authenticateToken, async (req: ICustomRequest, res: Response, next: NextFunction) => {
//     try {
//         const patientId = req.user.role === USER_ROLES.PATIENT ? req.user.patient_id : req.query.patientId as string;
//         const response = await getBriefings(patientId);
//         res.send(response);
//     } catch (err) {
//         next(err);
//     }
// });

router.get('/api/v1/briefing', authenticateToken, async (req: ICustomRequest, res: Response, next: NextFunction) => {
    try {
        const briefingId = req.query.briefingId as string;
        console.log(briefingId);
        const response = await getBriefing(briefingId);
        res.send(response);
    } catch (err) {
        next(err);
    }
});

export default router;