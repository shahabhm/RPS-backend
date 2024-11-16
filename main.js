const express = require('express')
const { createServer } = require("http");
const { Server } = require("socket.io");
const mqtt = require('mqtt');
const { query, body, validationResult } = require('express-validator');
const bodyParser = require('body-parser')
const cors = require('cors');
const multer = require("multer");
// const upload = multer({ dest: "uploads/" });
const app = express()
const port = 3000
const { application } = require("express");
const handlers = require('./application')
const { generateAccessToken, authenticateToken } = require('./jwt')
const errors = require('./errors');
const winston = require('winston');
const { validate } = require("node-cron");
const constants = require('./constants');
const jwt = require("jsonwebtoken");

const logger = winston.createLogger({
    level: 'info', format: winston.format.json(), transports: [new winston.transports.Console()],
});

logger.info('Hello from Winston logger!')

app.use(bodyParser.urlencoded({ extended: true }))

app.use(bodyParser.json())

app.use(cors())

const httpServer = createServer(app);

const usersSocketConnections = new Map();

const io = new Server(httpServer, {
    path: '/api/socket.io',
    // TODO: socket
    // cors: {
    //     origin: 'http://localhost:3001',
    //     methods: ['GET', 'POST']
    // }
});

io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
        return next(new Error("Authentication error"));
    }

    jwt.verify(token, '12345', (err, decoded) => {
        if (err) {
            return next(new Error("Authentication error"));
        }
        socket.account_id = decoded.account_id;
        next();
    });
});

io.on('connection', (socket) => {
    // Add user to the connected users map
    usersSocketConnections.set(socket.account_id, socket.id);
    console.log(`User ${socket.account_id} connected with socket ID ${socket.id}`);

    // Listen for `sendMessageToUser` events for targeted messages
    socket.on('sendMessageToUser', ({ targetUserId, message }) => {
        const targetSocketId = usersSocketConnections.get(targetUserId);
        if (targetSocketId) {
            io.to(targetSocketId).emit('receiveMessage', message);
        } else {
            console.log(`User ${targetUserId} is not connected`);
        }
    });

    // Clean up when a user disconnects
    socket.on('disconnect', () => {
        console.log(`User ${socket.account_id} disconnected`);
        usersSocketConnections.delete(socket.account_id);
    });
});

httpServer.listen(port);


// Connect to the RabbitMQ server using the MQTT plugin
const mqttClient = mqtt.connect(process.env.RABBIT_URI, {username: process.env.RABBIT_USER, password: process.env.RABBIT_PASSWORD});

// Subscribe to a topic
mqttClient.on('connect', () => {
    console.log('Connected to RabbitMQ MQTT');
    mqttClient.subscribe('testing', (err) => {
        if (!err) {
            console.log('Subscribed to topic');
        } else {
            console.error('Subscription error:', err);
        }
    });
});

// Handle incoming messages
mqttClient.on('message', (topic, message) => {
    console.log(`Received message on topic ${topic}: ${message.toString()}`);
    try {
        const convertedMessage = JSON.parse(message.toString());
        console.log(convertedMessage);
        const { device_id, parameter, value } = convertedMessage;
        handlers.capture_parameter(device_id, parameter, value);
    } catch (e){
        console.error(e);
    }
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({ storage: storage });

app.post('/api/v1/upload', upload.single('image'), (req, res) => {
    try {
        res.status(200).json({ message: 'File uploaded successfully', file: req.file });
    } catch (error) {
        res.status(500).json({ message: 'Error uploading file', error });
    }
});

app.post("/subscribe", authenticateToken, async (req, res) => {
    console.log(req.body);
    const subscription = req.body;
    await handlers.subscribe_push(req.user.account_id, subscription);
    res.send({ result: "OK" });
});

app.get('/api/server/test', (req, res) => {
    res.send('Hello World!')
})

app.get('/api/v1/uploads/:file', async (req, res) => {
    const { file } = req.params;
    res.sendFile(__dirname + '/uploads/' + file);
})


const handle_api_error = function (err, req, res, next) {
    console.log('here');
    console.error(`ERROR at endpoint: ${req.url}, request body: ${JSON.stringify(req.body)}, error: ${err}, stack trace: ${err.stack}`);
    const error_string = errors[err.message];
    if (error_string) {
        res.status(error_string.status_code);
        res.send({ error: error_string.error_string });
    } else {
        res.status(500);
        res.send({ error: 'Internal server error' });
    }
}

const validate_api = function (req, res, next) {
    const api_validation_result = validationResult(req);
    if (!api_validation_result.isEmpty()) {
        res.status(400);
        res.send({ errors: api_validation_result.array() });
    } else next();
}

app.post('/api/v1/user/login',
    body('phoneNumber').notEmpty(),
    body('password').notEmpty(),
    validate_api,
    async (req, res, next) => {
        try {
            console.log(`POST /api/v1/user/login, req.body: ${JSON.stringify(req.body)}`);
            const { phoneNumber, password } = req.body;
            const response = await handlers.login(phoneNumber, password);
            res.send(response);
        } catch (e) {
            next(e);
        }
    });

app.post('/api/v1/user/signup',
    body('phoneNumber').isMobilePhone('ir-IR'),
    body('password').isLength({ min: 3, max: 255 }),
    validate_api,
    async (req, res, next) => {
        try {
            console.log(`POST /api/v1/user/signup, req.body: ${JSON.stringify(req.body)}`);
            const { phoneNumber, password } = req.body;
            await handlers.signup_mobile(phoneNumber, password);
            res.send({ response: 'کد یکبار مصرف به شماره تلفن شما پیامک شد.' });
        } catch (e) {
            next(e);
        }
    }
);

app.post('/api/v1/user/signup-otp',
    body('phone_number').isMobilePhone('ir-IR'),
    body('otp').notEmpty(),
    validate_api,
    async (req, res, next) => {
        try {
            const { phone_number, otp } = req.body;
            const response = await handlers.confirm_otp(phone_number, otp);
            res.send(response);
        } catch (e) {
            next(e);
        }
    }
);

app.post('/api/v1/user/forget_password',
    body("phone_number").isMobilePhone('ir-IR'),
    validate_api,
    async (req, res, next) => {
        try {
            const { phone_number } = req.body;
            await handlers.forget_password(phone_number);
            res.send({ response: "کد تایید برای شماره همراه وارد شده پیامک می شود." });
        } catch (e) {
            next(e);
        }
    });

app.post('/api/v1/user/reset_password',
    body('password').isLength({ min: 4 }),
    validate_api,
    authenticateToken,
    async (req, res, next) => {
        try {
            const { password } = req.body;
            await handlers.reset_password(req.user.account_id, password);
            res.send({ response: "تغییر رمز با موفقیت انجام شد." });
        } catch (e) {
            next(e);
        }
    }
);

app.post('/api/v1/patient/register',
    body('firstName').isString(),
    body('lastName').isString(),
    body('nationalCode').isString(),
    body('city').isString(),
    body('gender').isString(),
    // body('birthdate').notEmpty(),
    body('weight').isInt({ min: 1, max: 1000 }),
    body('height').isInt({ min: 1, max: 300 }),
    body('bloodType').isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
    validate_api,
    authenticateToken,
    async (req, res, next) => {
        try {
            const { firstName, lastName, nationalCode, city, gender, birthdate, weight, height, bloodType } = req.body;
            const response = await handlers.register_new(req.user.account_id, firstName, lastName, nationalCode, city, gender, birthdate, weight, height, bloodType);
            res.send(response);
        } catch (err) {
            next(err);
        }
    }
);

app.post('/api/v1/doctor/register',
    body('firstName').isString(),
    body('lastName').isString(),
    body('nationalCode').isString(),
    body('nezamCode'),
    body('specialization'),
    body('province'),
    body('city').isString(),
    body('schedule'),
    validate_api,
    authenticateToken,
    async (req, res, next) => {
        try {
            const { firstName, lastName, nationalCode, nezamCode, specialization, province, city, schedule } = req.body;
            const response = await handlers.register_doctor(req.user.account_id, firstName, lastName, nationalCode, nezamCode, specialization, province, city);
            res.send(response);
        } catch (err) {
            next(err);
        }
    }
);

app.post('/api/v1/doctor/schedule',
    async (req, res, next) => {
        try {
            console.log(req.body);
            const {workingDays} = req.body;
            for (workingDay in workingDays) {
            //     validate the input
                if (workingDays.startHour === "" || workingDays.endHour === "" || workingDays.startHour > workingDays.endHour) {
                    throw new Error('INVALID_INPUT');
                }
            }
            const response = handlers.set_doctor_schedule(workingDays);
            res.send(response)
        } catch (e) {
            next(e);
        }
    }
);

app.get('/api/v1/patient/parameters', async (req, res, next) => {
    try {
        const condition_names = await handlers.get_condition_names();
        const blood_types = constants.BLOOD_TYPES;
        const medicine_names = await handlers.get_medicines_names();
        const allergies_names = await handlers.get_allergies_names();
        res.send({
            condition_names,
            blood_types,
            medicine_names,
            allergies_names
        });
    } catch (e) {
        next(e);
    }
});

app.post('/api/v1/patient/set_condition_description',
    body('conditionDescription').isString().isLength({ max: 1000 }),
    validate_api,
    authenticateToken,
    async (req, res, next) => {
        try {
            const { conditionDescription } = req.body;
            await handlers.set_condition_description(req.user.account_id, conditionDescription);
            res.send({ response: "تغییر انجام شد." });
        } catch (err) {
            next(err);
        }
    }
);

app.post('/api/v1/patient/set_condition_history',
    body('items').isArray(),
    validate_api,
    authenticateToken,
    async (req, res, next) => {
        try {
            const {items} = req.body;
            await handlers.set_conditions_history(req.user.account_id, items);
            res.send({response: "تغییر انجام شد."});
        } catch (e) {
            next(e);
        }
    }
);

app.post('/api/v1/patient/set_family_history',
    body('items').isArray(),
    validate_api,
    authenticateToken,
    async (req, res, next) => {
        try{
            const { items } = req.body;
            await handlers.set_family_history(req.user.account_id, items);
            res.send({ response: "تغییر انجام شد." });
        } catch(err) {
            next(err);
        }
    }
);

app.post('/api/v1/patient/set_medicines',
    body('items'),
    validate_api,
    authenticateToken,
    async (req, res, next) => {
        try {
            const { items } = req.body;
            await handlers.set_medicines(req.user.account_id, items);
            res.send({ response: "تغییر انجام شد." });
        } catch (err) {
            next(err);
        }
    }
);

app.post('/api/v1/patient/set_allergies',
    body('items'),
    validate_api,
    authenticateToken,
    async (req, res, next) => {
        try {
            const { items } = req.body;
            await handlers.set_allergies(req.user.account_id, items);
            res.send({ response: "تغییر انجام شد." });
        } catch (err) {
            next(err);
        }
    }
);

app.get('/api/v1/patient/my_info', authenticateToken, async (req, res, next) => {
    try {
        const response = await handlers.get_patient(req.user.account_id);
        response.profile_picture = 'sina.png';
        res.send(response);
    } catch (err) {
        next(err);
    }
});


app.post('/api/v1/patient/add_briefing',
    body('patientId').notEmpty(),
    body('description').notEmpty(),
    validate_api,
    async (req, res, next) => {
        try {
            const { patientId, description } = req.body;
            const response = await handlers.add_briefing(patientId, "doctor_id", description);
            res.send(response);
        } catch (err) {
            next(err);
        }
    }
);

app.post('/api/v1/patient/update_briefing',
    body('briefing_id').isString(),
    body('description').isString(),
    validate_api,
    async (req, res, next) => {
        try {
            const { briefing_id, description } = req.body;
            const response = await handlers.update_briefing(briefing_id, description);
            res.send(response);
        }catch(e) {
            next(e);
        }
    }
);

app.post('/api/v1/patient/delete_briefing',
    body('briefing_id').isString(),
    validate_api,
    async (req, res, next) => {
        try {
            const { briefing_id } = req.body;
            const response = await handlers.delete_briefing(briefing_id);
            res.send(response);
        } catch (e) {
            next(e);
        }
    }
);


app.get('/api/v1/patient/parameter_names',
    async (req, res, next) => {
        try {
            const response = await handlers.get_parameter_names();
            res.send(response);
        } catch (e) {
            next(e);
        }
    }
);

app.post('/api/v1/patient/capture_parameter',
    body('patient_id').isString(),
    body('parameter').isString(),
    body('value').notEmpty(),
    validate_api,
    async (req, res, next) => {
        try {
            const { patient_id, parameter, value } = req.body;
            const response = await handlers.capture_parameter(patient_id, parameter, value);
            res.send(response);
        } catch (e) {
            next(e);
        }
    }
);

// TODO: this must be refactored for the new parameters page
app.post('/api/v1/patient/get_parameters',
    body('patient_id').notEmpty(),
    validate_api,
    async (req, res, next) => {
        try {
            const { patient_id } = req.body;
            const response = await handlers.get_parameters(patient_id);
            res.send(response);
        } catch (e) {
            next(e);
        }
    }
);

//         {
//             parameter_name: 'Heart Rate',
//             value: 80,
//             unit: 'BPM'
//         }

app.get('/api/v1/patient/last_parameters',
    async (req, res, next) => {
        try {
            res.send([
                {
                    parameter_name: 'ضربان قلب',
                    value: 80,
                    unit: 'BPM'
                },        {
                    parameter_name: 'قند خون',
                    value: 80,
                    unit: 'mg/dl'
                },
                {
                    parameter_name: 'اکسیژن خون',
                    value: 80,
                    unit: '%'
                }
            ])
        } catch (e) {
            next(e);
        }
    }
    );

app.post('/api/v1/patient/medicine/add',
    body('medicineName').isString(),
    body('dosage').isNumeric(),
    body('amount').isNumeric(),
    body('repeatCount').isInt(),
    body('unit').isString(),
    body('description').isString(),
    body('withFood').isString(),
    validate_api,
    authenticateToken,
    async (req, res, next) => {
        try {
            const { account_id } = req.user.account_id;
            const { medicineName, dosage, amount, repeatCount, unit, description, withFood } = req.body;
            const response = await handlers.add_patient_medicine(account_id, medicineName, dosage, amount, repeatCount, unit, description, withFood);
        res.send(response);
        } catch (err) {
            next(err);
        }
    }
);

app.post('/api/v1/doctor/add_prescription',
    body('patient_id').notEmpty(),
    body('doctor_id').notEmpty(),
    body('medicines').isArray(),
    body('note').notEmpty(),
    validate_api,
    async (req, res, next) => {
        try {
            const { patient_id, doctor_id, medicines, note } = req.body;
            const response = await handlers.add_prescription(patient_id, doctor_id, medicines, note);
            res.send(response);
        } catch (e) {
            next (e);
        }
    }
);

app.get('/api/v1/hospital/list',
    async (req, res, next) => {
        try {
            const { city, latitude, longitude } = req.query;
            const response = await handlers.get_hospitals(city, latitude, longitude);
            res.send(response);
        } catch (e) {
            next (e);
        }
    });

app.get('/api/v1/doctor/list',
    async (req, res, next) => {
        try {
        const { city, name, specialization } = req.query;
        const response = await handlers.get_doctors(city, name, specialization);
        res.send(response);
        } catch (e) {
            next (e);
        }
    }
);

app.post('/api/v1/doctor/specializations_list', async (req, res, next) => {
    res.send(constants.DOCTORS_SPECIALIZATION);
});

app.get('/api/v1/doctor/available_times',
    async (req, res, next) => {
        try {
            const { doctor_id, date } = req.query;
            const response = await handlers.get_available_times(doctor_id, date);
            res.send(response);
        } catch (err) {
            next(err);
        }
    }
);

app.post('/api/v1/doctor/reserve_time',
    authenticateToken,
    async (req, res, next) => {
        try {
            const { doctor_id, date, time_slot } = req.body;
            const response = await handlers.reserve_time(req.user.account_id, doctor_id, date, time_slot);
            res.send(response);
        } catch (e) {
            next(e);
        }
    });

app.get('/api/v1/reservations/list',
    query('only_active').isBoolean(),
    authenticateToken,
    async (req, res) => {
        const only_active = req.query.only_active === 'true';
        const response = await handlers.get_reservations(req.user.account_id, only_active);
        res.send([
            {
                "_id": "66cd894be2cbd35c86b5879b",
                "doctor_id": {
                    "_id": "66b7a942e10b969d40b1d185",
                    "first_name": "Hossein",
                    "last_name": "Karimi",
                    "specialization": "Neurologists",
                    "profile_picture": "http://example.com/hossein_karimi.jpg"
                },
                "patient_id": "66cd7d7a7f5555fdcc47d159",
                "date": "2025-01-05T20:30:00.000Z",
                "time_slot": "10:20",
                "cancelled": false,
                "__v": 0
            },
            {
                "_id": "66cd896809f341006ac643f2",
                "doctor_id": {
                    "_id": "66b7a942e10b969d40b1d185",
                    "first_name": "Hossein",
                    "last_name": "Karimi",
                    "specialization": "Neurologists",
                    "profile_picture": "http://example.com/hossein_karimi.jpg"
                },
                "patient_id": "66cd7d7a7f5555fdcc47d159",
                "date": "2025-01-05T20:30:00.000Z",
                "time_slot": "10:40",
                "cancelled": false,
                "__v": 0
            }
        ]);
    }
);

app.get('/api/v1/doctor/introduction',
    query('doctorId').notEmpty(),
    async (req, res, next) => {
        try {
            const { doctorId } = req.query;
            const response = await handlers.get_doctor_introduction(doctorId);
            response.description = "ایشان مدرک دکتری عمومی خود را در سال ۱۳۹۰ از دانشگاه تهران دریافت کردند."
            console.log(response);
            res.send(response);
        } catch (err) {
            next(err);
        }
    });

app.get('/api/v1/patient/notifications',
    // authenticateToken,
    async (req, res) => {
        res.send({
            urgentReminders: [
                {
                    title: 'ضربان غیر طبیعی',
                    body: 'ضربان قلب شما بیش از حد زیاد است',
                    type: 'criticalAlert',
                    actionButton: 'تماس با پزشک',
                    actionButtonLink: '/user/patient/emergency',
                },
            ],
            currentReminders: [
                {
                    title: 'یادآور دارو',
                    body: 'استامینوفن',
                    type: 'meds'
                },
                {
                    title: 'ملاقات با دکتر حسینی',
                    body: 'نوبت شما ساعت ۱۷:۱۵ است.',
                    type: 'doctorVisit',
                    actionButton: 'اطلاعات بیشتر'
                }
            ]
        });
    }
);

// v1/doctor/patients
app.get('/api/v1/doctor/patients',
    // authenticateToken,
    async (req, res) => {
        const { page, limit, urgent } = req.query;
        // const {doctor_id} = req.user.account_id;
        console.log(page, limit, urgent);
        res.send([
            {
                name: 'شهاب مقدم',
                place: 'در بیمارستان',
                status_text: 'وضعیت پایدار',
                status_code: 'stable',
                image: '/sina.png',
                profile_link: '/user/doctor/pid',
                profile_picture: 'sina.png',
            }
        ]);
    }
);

let shitCounter = 0;

// v1/doctor/meetings
app.get('/api/v1/doctor/meetings',
    //  authenticateToken,
    async (req, res) => {
        shitCounter += 1;
        const { page, limit } = req.query;
        // const {doctor_id} = req.user.account_id;
        console.log(page, limit);
        res.send({
            page: page,
            limit: limit,
            totalPages: 10,
            totalItems: 100,
            items: [
            {
                name: 'شهاب مقدم' + shitCounter,
                start_time: '12:40',
                finish_time: '12:50',
                date: '2024/09/11'
            },
            {
                name: 'شهاب مقدم',
                start_time: '12:40',
                finish_time: '12:50',
                date: '2024/09/11'
            },
            {
                name: 'شهاب مقدم',
                start_time: '12:40',
                finish_time: '12:50',
                date: '2024/09/11'
            },
            {
                name: 'شهاب مقدم',
                start_time: '12:40',
                finish_time: '12:50',
                date: '2024/09/11'
            },
            {
                name: 'شهاب مقدم',
                start_time: '12:40',
                finish_time: '12:50',
                date: '2024/09/11'
            },
            {
                name: 'شهاب مقدم',
                start_time: '12:40',
                finish_time: '12:50',
                date: '2024/09/11'
            },
            {
                name: 'شهاب مقدم',
                start_time: '12:40',
                finish_time: '12:50',
                date: '2024/09/11'
            },
            {
                name: 'شهاب مقدم',
                start_time: '12:40',
                finish_time: '12:50',
                date: '2024/09/11'
            },
            {
                name: 'شهاب مقدم',
                start_time: '12:40',
                finish_time: '12:50',
                date: '2024/09/11'
            },
            {
                name: 'شهاب مقدم',
                start_time: '12:40',
                finish_time: '12:50',
                date: '2024/09/11'
            },
        ]})
    });

// v1/doctor/info
app.get('/api/v1/doctor/info',
    //  authenticateToken,
    async (req, res) => {
        // const {doctor_id} = req.user.account_id;
        res.send({
            name: 'سینا احمدی',
            profile_picture: 'sina.png'
        })
    });

app.get('/api/v1/general/provinces',
    async (req, res) => {
        res.send(constants.PROVINCES);
    }
)

app.get('/api/v1/general/province', 
    async (req, res) => {
        const { provinceName, provinceId } = req.query;
        const ppp = constants.ALL_CITIES.filter(province => {
            return (provinceId && province.provinceId === provinceId) || 
                   (provinceName && province.provinceName.toLowerCase() === provinceName.toLowerCase());
          });
          if (ppp.length === 0) res.send({});
        res.send(ppp[0]);
    }
);

app.get('/api/v1/user/chats',
    authenticateToken,
    async (req, res, next) => {
        try {
            const {account_id} = req.user;
            const response = await handlers.get_chat_list(account_id);
            res.send(response);
        } catch (err) {
            next(err);
        }
    }
);

// create a new chat
app.post('/api/v1/user/chats', authenticateToken, async (req, res, next) => {
    try {
        const response = await handlers.create_chat(req.user.account_id, req.body.doctor_id);
        res.send(response);
    } catch (e) {
        next(e);
    }
});

app.post ('/api/v1/user/chats/send', authenticateToken, async function (req, res, next) {
    try {
        const sender_id = req.user.account_id;
        const { chat_id, text, image_name } = req.body;
        const {message, chat} = await handlers.send_message(sender_id, chat_id, text, image_name);
        console.log(chat);
        io.to(usersSocketConnections.get(chat.user1.toString())).emit('receiveMessage', message);
        io.to(usersSocketConnections.get(chat.user2.toString())).emit('receiveMessage', message);
        res.send(message);
    } catch (err) {
        next(err);
    }
});

app.get('/api/v1/user/chats/messages', authenticateToken, async (req, res, next) => {
    try {
        const {account_id} = req.user;
        const {chatId} = req.query;
        console.log(chatId);
        const messages = await handlers.get_messages(chatId, account_id);
        res.send({
            messages,
            yourId: req.user.account_id
        });
    } catch (err) {
        next(err);
    }
  });

app.post('/api/v1/patient/register_device', authenticateToken, async (req, res, next) => {
    try {
        const {account_id} = req.user;
        const {device_code} = req.body;
        const response = await handlers.register_device(account_id, device_code);
        res.send(response);
    } catch (e) {
        next(e);
    }
});

//         {
//             title: 'تخفیف ویژه برای تهیه‌ی دستگاه',
//             body: 'شما می‌توانید تا ۳ روز آینده دستگاه پایش سلامت را با تخفیف ويژه خریداری کنید.',
//             type: 'call',
//             actionButton: 'تماس با واحد فروش',
//             actionButtonLink: 'tel:09156289830'
//         }
// write a /patient/promotions API

app.get('/api/v1/patient/promotions', async (req, res, next) => {
   try {
       res.send([
               {
                   title: 'تخفیف ویژه برای تهیه‌ی دستگاه',
                   body: 'شما می‌توانید تا ۳ روز آینده دستگاه پایش سلامت را با تخفیف ويژه خریداری کنید.',
                   type: 'call',
                   actionButton: 'تماس با واحد فروش',
                   actionButtonLink: 'tel:09156289830'
               }, {
                   title: 'بدون دردسر نوبت ویزیت تهیه کنید!',
                   body: 'شما می‌توانید به سرعت و به صورت آنلاین، از پزشکان ما نوبت بگیرید.',
                   type: 'tick',
                   actionButton: 'جستجو میان پزشکان',
                   actionButtonLink: '/user/patient/doctors'
               }
           ]
       );
   } catch (e) {
       next(e);
   }
});

// THIS MUST BE THE LAST MIDDLEWARE OR IT WON'T WORK. GOD I LOVE NODEJS AND EXPRESS
app.use(handle_api_error);