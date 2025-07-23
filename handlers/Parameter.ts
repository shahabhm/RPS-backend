import {NextFunction, Request, Response, Router} from "express"
import {
    getLastParameters,
    getParameterBounds,
    getParameterNames,
    getParameters,
    getParametersOverview,
    submitParameter
} from "../ts_handlers";
import {body, param, query} from "express-validator";
import {authenticateToken, ICustomRequest, validateAPI} from "../Middlewares";
import {USER_ROLES} from "../constants";

const router = Router();

router.get('/api/v1/parameter/names',
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const response = await getParameterNames();
            res.send(response);
        } catch (e) {
            next(e);
        }
    }
);

router.post('/api/v1/parameter',
    body('parameter').isString(),
    body('value').notEmpty(),
    validateAPI,
    authenticateToken,
    async (req: ICustomRequest, res: Response, next: NextFunction) => {
        try {
            console.log(req.body);
            const patientId = req.user.role === USER_ROLES.PATIENT? req.user.patient_id : req.body.patientId as string;
            const {parameter, value} = req.body;
            const time = req.body.time? req.body.time : new Date();
            const response = await submitParameter(patientId, parameter, value, time);
            res.send(response);
        } catch (e) {
            next(e);
        }
    }
);

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

// v1/patient/${patient_id}/parameter_bound

router.get('/api/v1/patient/:patientId/parameter_bound/:parameter',
    param('parameter').notEmpty(),
    param('patientId').notEmpty(),
    validateAPI,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const {patientId, parameter} = req.params;
            const response = await getParameterBounds(patientId, parameter);
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
            const patient_id = req.user.role === 'patient' ? req.user.patient_id : req.query.patientId as string;
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
            const response = await getParametersOverview(patient_id);
            res.send(response);
        } catch (e) {
            next(e);
        }
    }
);



export default router;