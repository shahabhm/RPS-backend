import {body} from "express-validator";
import {authenticateToken, ICustomRequest, validateAPI} from "../Middlewares";
import {NextFunction, Response, Router} from "express";
import {addPrescription, finishMeeting, getMeeting, getMeetings, startMeeting} from "../ts_handlers";

const router = Router();

router.post('/api/v1/meeting/prescription',
    body('meetingId').isString,
    body('medicines').isArray(),
    body('note').isString(),
    validateAPI,
    async (req: ICustomRequest, res: Response, next: NextFunction) => {
        try {
            const {meetingId, medicines, note} = req.body;
            const response = await addPrescription(meetingId, medicines, note);
            res.send(response);
        } catch (e) {
            next(e);
        }
    }
);

// returns the list of meetings
router.get('/api/v1/meetings',
    authenticateToken,
    async (req: ICustomRequest, res: Response, next: NextFunction) => {
        const {page, limit} = req.query;
        console.log(page, limit);
        const response = await getMeetings(req.user.patient_id, req.user.doctor_id);
        res.send({items: response});
    });

router.get('/api/v1/meeting',
    authenticateToken,
    async (req: ICustomRequest, res: Response, next: NextFunction) => {
        const {meetingId} = req.query;
        const meeting = await getMeeting(meetingId as string);
        res.send(meeting);
    });

router.post('/api/v1/meeting/start',
    authenticateToken,
    async (req: ICustomRequest, res: Response, next: NextFunction) => {
        const {meetingId} = req.body;
        const meeting = await startMeeting(meetingId);
        res.send(meeting);
    });

router.post('/api/v1/meeting/finish',
    authenticateToken,
    async (req: ICustomRequest, res: Response, next: NextFunction) => {
        const {meetingId} = req.body;
        const meeting = await finishMeeting(meetingId);
        res.send(meeting);
    });


export default router;