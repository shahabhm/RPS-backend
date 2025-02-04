import {Router, Response, NextFunction} from 'express';
import {body} from "express-validator";
import {authenticateToken, ICustomRequest, validateAPI} from "../Middlewares";
import {registerPatient} from "../ts_handlers";




const router = Router();

router.post('/api/v1/patient/register',
    body('firstName').isString(),
    body('lastName').isString(),
    body('nationalCode').isString(),
    body('city').isString(),
    body('gender').isString(),
    // body('birthdate').notEmpty(),
    body('weight').isInt({ min: 1, max: 1000 }),
    body('height').isInt({ min: 1, max: 300 }),
    body('bloodType').isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
    body('allergies').isArray(),
    body('medicines').isArray(),
    body('family_history').isArray(),
    body('condition_history').isArray(),
    body('condition_description').isString(),
    body('profile_picture').isString(),
    validateAPI,
    authenticateToken,
    async (req: ICustomRequest, res: Response, next: NextFunction) => {
        try {
            const { firstName, lastName, nationalCode, city, gender, birthdate, weight, height, bloodType, allergies, medicines, family_history, condition_history, condition_description, profile_picture } = req.body;
            const response = await registerPatient(req.user.account_id, firstName, lastName, nationalCode, city, gender, birthdate, weight, height, bloodType, allergies, medicines, family_history, condition_history, condition_description, profile_picture);
            res.send(response);
        } catch (err) {
            next(err);
        }
    }
);

// returns the information of a patient
router.get('/api/v1/patients/:patient_id',
    authenticateToken,
    async (req: ICustomRequest, res: Response, next: NextFunction) => {
        try {
            const { patient_id } = req.params;
            const patient = await getPatientInfo(patient_id);
            res.send(patient);
        } catch (e) {
            next(e);
        }
    }
);


export default router;