import {NextFunction, Request, Response, Router} from "express"
import {captureParameter, getLastParameters, getParameters} from "../ts_handlers";
import {body, query} from "express-validator";
import {authenticateToken, ICustomRequest, validateAPI} from "../Middlewares";

const router = Router();

router.get('/api/v1/patient/parameter_names',
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const response = await getParameterNames();
            res.send(response);
        } catch (e) {
            next(e);
        }
    }
);

router.post('/api/v1/patient/capture_parameter',
    body('patient_id').isString(),
    body('parameter').isString(),
    body('value').notEmpty(),
    validateAPI,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const {device_id, parameter, value} = req.body;
            const time = new Date();
            const response = await captureParameter(device_id, parameter, value, time);
            res.send(response);
        } catch (e) {
            next(e);
        }
    }
);

// now write get_parameters using typescript

router.get('/api/v1/patient/get_parameters',
    query('parameter').notEmpty(),
    query('device_id').notEmpty(),
    query('selected_time').notEmpty(),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const {patient_id, parameter, selected_time} = req.query;
            console.log(patient_id, parameter, selected_time);
            const response = await getParameters(patient_id as string, parameter as string, new Date(selected_time as string));
            res.send(response);
        } catch (e) {
            next(e);
        }
    }
);

router.get('/api/v1/patient/get_parameters_details',
    query('parameter').notEmpty(),
    query('device_id').notEmpty(),
    validateAPI,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const {device_id, parameter} = req.query;
            const response = await getParameterExtremes(device_id, parameter);
            res.send(response);
        } catch (e) {
            next(e);
        }
    }
);

router.get('/api/v1/patient/last_parameters',
    authenticateToken,
    async (req: ICustomRequest, res: Response, next: NextFunction) => {
        try {
            const patient_id = req.user.role === 'patient' ? req.user.patient_id : req.query.patient_id as string;
            const response = await getLastParameters(patient_id);
            res.send(response);
        } catch (e) {
            next(e);
        }
    }
);

router.get('/api/v1/patient/parameters_overview',
    authenticateToken,
    async (req: ICustomRequest, res: Response, next: NextFunction) => {
        try {
            const patient_id = req.user.role === 'patient' ? req.user.patient_id : req.query.patient_id;
            const response = await getPatientParametersOverview(patient_id);
            res.send(response);
        } catch (e) {
            next(e);
        }
    }
);



export default router;