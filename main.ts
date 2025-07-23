import express, {Request, Response} from 'express';
import {createServer} from 'http';
import bodyParser from 'body-parser';
import cors from 'cors';
import multer from 'multer';
import winston from 'winston';
import {initializeSocket} from './socket';
import './NotificationsCronjob';
import './MockDataCronjob';
import {handleAPIErrors} from './Middlewares';
import accountRouter from './handlers/Account';
import promotionRouter from './handlers/Promotion';
import chatRouter from './handlers/Chat';
import patientRouter from './handlers/Patient';
import parameterRouter from './handlers/Parameter';
import notificationRouter from './handlers/Notification';
import doctorRouter from './handlers/Doctor';
import meetingRouter from './handlers/Meeting';
import observationRouter from './handlers/Observation';
import briefingRouter from './handlers/Briefing';

require('source-map-support').install();

const app = express();
const port = 3000;

const logger = winston.createLogger({
    format: winston.format.json(),
    transports: [new winston.transports.Console()],
});

logger.info(`server is running in ${process.env.NODE_ENV} environment on port ${port}`);

app.use(bodyParser.urlencoded({extended: true}));
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

const upload = multer({storage: storage});

app.use('', accountRouter);
app.use('', promotionRouter);
app.use('', chatRouter);
app.use('', patientRouter);
app.use('', parameterRouter);
app.use('', notificationRouter);
app.use('', doctorRouter);
app.use('', meetingRouter);
app.use('', observationRouter);
app.use('', briefingRouter)


app.post('/api/v1/upload', upload.single('image'), (req: Request, res: Response) => {
    try {
        res.status(200).json({message: 'File uploaded successfully', file: req.file});
    } catch (error) {
        res.status(500).json({message: 'Error uploading file', error});
    }
});

app.get('/api/server/test', async (req: Request, res: Response) => {
    res.send('hello!');
});

app.get('/api/v1/uploads/:file', async (req: Request, res: Response) => {
    const {file} = req.params;
    res.sendFile(__dirname.substring(0, __dirname.length - 5) + '/uploads/' + file);
});

app.use(handleAPIErrors);