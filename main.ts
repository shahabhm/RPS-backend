import express, { Request, Response, NextFunction } from 'express';
import { createServer } from 'http';
import { query, body, validationResult } from 'express-validator';
import bodyParser from 'body-parser';
import cors from 'cors';
import multer from 'multer';
import winston from 'winston';
import { initializeSocket, sendNotification } from './socket';
import {authenticateToken, validateAPI, handleAPIErrors, IRequestUser} from './Middlewares';
import {confirmOTP, login, signup} from './ts_handlers';
import accountRouter from './handlers/Account';

const app = express();
const port = 3000;

const logger = winston.createLogger({
    format: winston.format.json(),
    transports: [new winston.transports.Console()],
});

logger.info(`server is running in ${process.env.NODE_ENV} environment on port ${port}`);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

const httpServer = createServer(app);
initializeSocket(httpServer);

httpServer.listen(port);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({ storage: storage });

app.use('', accountRouter);

app.post('/api/v1/upload', upload.single('image'), (req: Request, res: Response) => {
    try {
        res.status(200).json({ message: 'File uploaded successfully', file: req.file });
    } catch (error) {
        res.status(500).json({ message: 'Error uploading file', error });
    }
});

app.get('/api/server/test', async (req: Request, res: Response) => {
    const skibidi = await ts_handlers.getChatList('672b2683e6f0fe57beedbd1a', false);
    res.send(skibidi);
});

app.get('/api/v1/uploads/:file', async (req: Request, res: Response) => {
    const { file } = req.params;
    res.sendFile(__dirname + '/uploads/' + file);
});

//
// app.get('/api/v1/patient/parameters', async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const condition_names = await handlers.get_condition_names();
//         const blood_types = constants.BLOOD_TYPES;
//         const medicine_names = await handlers.get_medicines_names();
//         const allergies_names = await handlers.get_allergies_names();
//         res.send({
//             condition_names,
//             blood_types,
//             medicine_names,
//             allergies_names
//         });
//     } catch (e) {
//         next(e);
//     }
// });
//
// app.get('/api/v1/patient/my_info', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const response = await handlers.get_patient(req.user.account_id);
//         response.profile_picture = 'sina.png';
//         res.send(response);
//     } catch (err) {
//         next(err);
//     }
// });
//
// app.post('/api/v1/patient/add_briefing',
//     body('patientId').notEmpty(),
//     body('description').notEmpty(),
//     validateAPI,
//     async (req: Request, res: Response, next: NextFunction) => {
//         try {
//             const { patientId, description } = req.body;
//             const response = await handlers.add_briefing(patientId, 'doctor_id', description);
//             res.send(response);
//         } catch (err) {
//             next(err);
//         }
//     }
// );
//
// app.post('/api/v1/patient/update_briefing',
//     body('briefing_id').isString(),
//     body('description').isString(),
//     validateAPI,
//     async (req: Request, res: Response, next: NextFunction) => {
//         try {
//             const { briefing_id, description } = req.body;
//             const response = await handlers.update_briefing(briefing_id, description);
//             res.send(response);
//         } catch (e) {
//             next(e);
//         }
//     }
// );
//
// app.post('/api/v1/patient/delete_briefing',
//     body('briefing_id').isString(),
//     validateAPI,
//     async (req: Request, res: Response, next: NextFunction) => {
//         try {
//             const { briefing_id } = req.body;
//             const response = await handlers.delete_briefing(briefing_id);
//             res.send(response);
//         } catch (e) {
//             next(e);
//         }
//     }
// );
//
// app.get('/api/v1/patient/parameter_names',
//     async (req: Request, res: Response, next: NextFunction) => {
//         try {
//             const response = await handlers.get_parameter_names();
//             res.send(response);
//         } catch (e) {
//             next(e);
//         }
//     }
// );
//
// app.post('/api/v1/patient/capture_parameter',
//     body('patient_id').isString(),
//     body('parameter').isString(),
//     body('value').notEmpty(),
//     validateAPI,
//     async (req: Request, res: Response, next: NextFunction) => {
//         try {
//             const { patient_id, parameter, value } = req.body;
//             const response = await handlers.capture_parameter(patient_id, parameter, value);
//             res.send(response);
//         } catch (e) {
//             next(e);
//         }
//     }
// );
//
// app.get('/api/v1/patient/get_parameters',
//     query('parameter').notEmpty(),
//     validateAPI,
//     async (req: Request, res: Response, next: NextFunction) => {
//         const { parameter, patient_id, selected_time } = req.query;
//         try {
//             const response = await handlers.get_parameters(patient_id, parameter, new Date(selected_time));
//             res.send(response);
//         } catch (e) {
//             next(e);
//         }
//     }
// );
//
// app.get('/api/v1/patient/get_parameters_details',
//     query('parameter').notEmpty(),
//     validateAPI,
//     async (req: Request, res: Response, next: NextFunction) => {
//         const { parameter, patient_id } = req.query;
//         try {
//             const response = await handlers.get_parameter_extremes(patient_id, parameter);
//             res.send(response);
//         } catch (e) {
//             next(e);
//         }
//     }
// );
//
// app.get('/api/v1/doctor/get_patient_parameters', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const { patient_id } = req.query;
//         const response = await handlers.get_latest_parameters(patient_id);
//         res.send(response);
//     } catch (e) {
//         next(e);
//     }
// });
//
// app.get('/api/v1/patient/last_parameters',
//     authenticateToken,
//     handlers.get_account_by_id,
//     async (req: Request, res: Response, next: NextFunction) => {
//         try {
//             const patient_id = req.account.role === 'patient' ? req.account.patient_id.toString() : req.query.patient_id;
//             const response = await handlers.get_latest_parameters(patient_id);
//             res.send(response);
//         } catch (e) {
//             next(e);
//         }
//     }
// );
//
// app.get('/api/v1/patient/parameters_overview',
//     authenticateToken,
//     handlers.get_account_by_id,
//     async (req: Request, res: Response, next: NextFunction) => {
//         try {
//             const patient_id = req.account.role === 'patient' ? req.account.patient_id.toString() : req.query.patient_id;
//             const response = await handlers.get_patient_parameters_overview(patient_id);
//             res.send(response);
//         } catch (e) {
//             next(e);
//         }
//     });
//
// app.post('/api/v1/patient/medicine/add',
//     body('medicineName').isString(),
//     body('dosage').isNumeric(),
//     body('amount').isNumeric(),
//     body('repeatCount').isInt(),
//     body('unit').isString(),
//     body('description').isString(),
//     body('withFood').isString(),
//     validateAPI,
//     authenticateToken,
//     async (req: Request, res: Response, next: NextFunction) => {
//         try {
//             const { account_id } = req.user.account_id;
//             const { medicineName, dosage, amount, repeatCount, unit, description, withFood } = req.body;
//             const response = await handlers.add_patient_medicine(account_id, medicineName, dosage, amount, repeatCount, unit, description, withFood);
//             res.send(response);
//         } catch (err) {
//             next(err);
//         }
//     }
// );

app.use(handleAPIErrors);