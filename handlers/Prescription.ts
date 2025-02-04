import {body} from "express-validator";
import {ICustomRequest, validateAPI} from "../Middlewares";
import {NextFunction, Response, Router} from "express";

const router = Router();


// create a new prescription for a meeting
router.post('/api/v1/prescriptions',
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