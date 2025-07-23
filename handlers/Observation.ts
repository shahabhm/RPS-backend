import {NextFunction, Response, Router} from 'express';
import {authenticateToken, ICustomRequest, validateRole} from "../Middlewares";
import {getDoctorPatients} from "../ts_handlers";
import {USER_ROLES} from "../constants";


const router = Router();

router.post('/api/v1/observation', authenticateToken, async (req: ICustomRequest, res: Response, next: NextFunction) => {
   try {
       const {patientId, text} = req.body;

   } catch (err) {
       next(err);
   }
});

// returns the list of patients that the doctor observes
router.get('/api/v1/observee', authenticateToken, validateRole(USER_ROLES.DOCTOR), async (req: ICustomRequest, res: Response, next: NextFunction) => {
        try {
            const {doctor_id} = req.user;
            const patients = await getDoctorPatients(doctor_id);
            res.send(patients);
        } catch (err) {
            next(err);
        }
    }
);

export default router;