const express = require('express')
const {query, body, validationResult} = require('express-validator');
const bodyParser = require('body-parser')
const cors = require('cors');
const multer = require("multer");
const upload = multer({dest: "uploads/"});
const app = express()
const port = 3000
const {application} = require("express");
const handlers = require('./application')
const {generateAccessToken, authenticateToken} = require('./jwt')
const errors = require('./errors');
const winston = require('winston');
const {validate} = require("node-cron");
const constants = require('./constants');

const logger = winston.createLogger({
    level: 'info', format: winston.format.json(), transports: [new winston.transports.Console()],
});

logger.info('Hello from Winston logger!')

app.use(bodyParser.urlencoded({extended: true}))

app.use(bodyParser.json())

app.use(cors())

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

app.post("/subscribe", authenticateToken, async (req, res) => {
    console.log(req.body);
    const subscription = req.body;
    await handlers.subscribe_push(req.user.account_id, subscription);
    res.send({result: "OK"});
});

app.get('/api/server/test', (req, res) => {
    res.send('Hello World!')
})

app.get('/uploads/:file', async (req, res) => {
    const {file} = req.params;
    res.sendFile(__dirname + '/uploads/' + file);
})


const handle_api_error = function (req, res, err) {
    console.error(`ERROR at endpoint: ${req.url}, request body: ${JSON.stringify(req.body)}, error: ${err}, stack trace: ${err.stack}`);
    const error_string = errors[err.message];
    if (error_string) {
        res.status(error_string.status_code);
        res.send({error: error_string.error_string});
    } else {
        res.status(500);
        res.send({error: 'Internal server error'});
    }

}

const validate_api = function (req, res, next) {
    const api_validation_result = validationResult(req);
    if (!api_validation_result.isEmpty()) {
        res.status(400);
        res.send({errors: api_validation_result.array()});
    } else next();
}

app.post('/api/v1/user/login',
    body('phoneNumber').notEmpty(),
    body('password').notEmpty(),
    validate_api,
    async (req, res) => {
        try {
            console.log(`POST /api/v1/user/login, req.body: ${JSON.stringify(req.body)}`);
            const {phoneNumber, password} = req.body;
            const response = await handlers.login(phoneNumber, password);
            res.send(response);
        } catch (e) {
            handle_api_error(req, res, e);
        }
    });

app.post('/api/v1/user/signup',
    body('phoneNumber').isMobilePhone('ir-IR'),
    body('password').notEmpty(),
    validate_api,
    async (req, res) => {
        try {
            console.log(`POST /api/v1/user/signup, req.body: ${JSON.stringify(req.body)}`);
            const {phoneNumber, password} = req.body;
            await handlers.signup_mobile(phoneNumber, password);
            res.send({response: 'کد یکبار مصرف به شماره تلفن شما پیامک شد.'});
        } catch (e) {
            handle_api_error(req, res, e);
        }
    }
);

app.post('/api/v1/user/signup-otp',
    body('phone_number').isMobilePhone('ir-IR'),
    body('otp').notEmpty(),
    validate_api,
    async (req, res) => {
        try {
            const {phone_number, otp} = req.body;
            const response = await handlers.confirm_otp(phone_number, otp);
            res.send(response);
        } catch (e) {
            handle_api_error(req, res, e);
        }
    }
);

app.post('/api/v1/user/forget_password',
    body("phone_number").isMobilePhone('ir-IR'),
    validate_api,
    async (req, res) => {
        try {
            const {phone_number} = req.body;
            await handlers.forget_password(phone_number);
            res.send({response: "کد تایید برای شماره همراه وارد شده پیامک می شود."});
        } catch (e) {
            handle_api_error(req, res, e);
        }
    });

app.post('/api/v1/user/reset_password',
    body('password').isLength({min: 4}),
    validate_api,
    authenticateToken,
    async (req, res) => {
        try{
            const {password} = req.body;
            await handlers.reset_password(req.user.account_id, password);
            res.send({response: "تغییر رمز با موفقیت انجام شد."});
        } catch (e) {
            handle_api_error(req, res, e)
        }
    }
    );

app.post('/api/v1/patient/register',
    body('firstName').isString(),
    body('lastName').isString(),
    body('nationalCode').isString(),
    body('city').isString(),
    body('gender').isString(),
    body('birthdate').notEmpty(),
    body('weight').isInt({min: 1, max: 1000}),
    body('height').isInt({min: 1, max: 300}),
    body('bloodType').isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
    validate_api,
    authenticateToken,
    async (req, res) => {
        try {
            const {firstName, lastName, nationalCode, city, gender, birthdate, weight, height, bloodType} = req.body;
            const response = await handlers.register_new(req.user.account_id, firstName, lastName, nationalCode, city, gender, birthdate, weight, height, bloodType);
            res.send(response);
        } catch (err) {
            handle_api_error(req, res, err);
        }
    }
);

app.get('/api/v1/patient/parameters', async (req, res) => {
    const condition_names = await handlers.get_condition_names();
    const blood_types = constants.BLOOD_TYPES;
    const medicine_names = await handlers.get_medicines_names();
    res.send({
        condition_names,
        blodd_types: blood_types,
        medicine_names
    });
});

app.post('/api/v1/patient/set_condition_description',
    body('conditionDescription').isString().isLength({max: 1000}),
    validate_api,
    authenticateToken,
    async (req, res) => {
        const {conditionDescription} = req.body;
        await handlers.set_condition_description(req.user.account_id, conditionDescription);
        res.send({response: "تغییر انجام شد."});
    }
);

app.post('/api/v1/patient/set_condition_history',
    body('items').isArray(),
    validate_api,
    authenticateToken,
    async (req, res) => {
        const {items} = req.body;
        await handlers.set_conditions_history(req.user.account_id, items);
        res.send({response: "تغییر انجام شد."});
    }
);

app.post('/api/v1/patient/set_family_history',
    body('items').isArray(),
    validate_api,
    authenticateToken,
    async (req, res) => {
        const {items} = req.body;
        await handlers.set_family_history(req.user.account_id, items);
        res.send({response: "تغییر انجام شد."});
    }
);

app.post('/api/v1/patient/set_medicines',
    body('items'),
    validate_api,
    authenticateToken,
    async (req, res) => {
        const {items} = req.body;
        await handlers.set_medicines(req.user.account_id, items);
        res.send({response: "تغییر انجام شد."});
    }
);

app.post('/api/v1/patient/set_allergies',
    body('items'),
    validate_api,
    authenticateToken,
    async (req, res) => {
        const {items} = req.body;
        await handlers.set_allergies(req.user.account_id, items);
        res.send({response: "تغییر انجام شد."});
    }
);

app.get('/api/v1/patient/my_info', authenticateToken, async (req, res) => {
    const response = await handlers.get_patient(req.user.account_id);
    res.send(response);
});


app.post('/api/v1/patient/add_briefing',
    body('patientId').notEmpty(),
    body('description').notEmpty(),
    validate_api,
    async (req, res) => {
        const {patientId, description} = req.body;
        const response = await handlers.add_briefing(patientId, "doctor_id", description);
        res.send(response);
    }
);

app.post('/api/v1/patient/update_briefing',
    body('briefing_id').isString(),
    body('description').isString(),
    validate_api,
    async (req, res) => {
        const {briefing_id, description} = req.body;
        const response = await handlers.update_briefing(briefing_id, description);
        res.send(response);
    }
);

app.post('/api/v1/patient/delete_briefing',
    body('briefing_id').isString(),
    validate_api,
    async (req, res) => {
        const {briefing_id} = req.body;
        const response = await handlers.delete_briefing(briefing_id);
        res.send(response);
    }
);


app.get('/api/v1/patient/parameter_names',
    async (req, res) => {
        const response = await handlers.get_parameter_names();
        res.send(response);
    }
);

app.post('/api/v1/patient/capture_parameter',
    body('patient_id').isString(),
    body('parameter').isString(),
    body('value').notEmpty(),
    validate_api,
    async (req, res) => {
        const {patient_id, parameter, value} = req.body;
        const response = await handlers.capture_parameter(patient_id, parameter, value);
        res.send(response);
    }
);

app.post('/api/v1/patient/get_parameters',
    body('patient_id').notEmpty(),
    validate_api,
    async (req, res) => {
        const {patient_id} = req.body;
        const response = await handlers.get_parameters(patient_id);
        res.send(response);
    }
);

app.post('/api/v1/patient/add_prescription',
    body('patient_id').notEmpty(),
    body('doctor_id').notEmpty(),
    body('medicines').isArray(),
    body('note').notEmpty(),
    validate_api,
    async (req, res) => {
        const {patient_id, doctor_id, medicines, note} = req.body;
        const response = await handlers.add_prescription(patient_id, doctor_id, medicines, note);
        res.send(response);
    }
);

app.get('/api/v1/hospital/list',
    async (req, res) => {
        const {city, latitude, longitude} = req.query;
        const response = await handlers.get_hospitals(city, latitude, longitude);
        res.send(response);
    });

app.get('/api/v1/doctor/list',
    async (req, res) => {
        const {city, name, specialization} = req.query;
        const response = await handlers.get_doctors(city, name, specialization);
        res.send(response);
    }
);

app.get('/api/v1/doctor/available_times',
    async (req, res) => {
        const {doctor_id, date} = req.query;
        const response = await handlers.get_available_times(doctor_id, date);
        res.send(response);
    }
);

app.post('/api/v1/doctor/reserve_time',
    authenticateToken,
    async (req, res) => {
        try {
            const {doctor_id, date, time_slot} = req.body;
            const response = await handlers.reserve_time(req.user.account_id, doctor_id, date, time_slot);
            res.send(response);
        } catch (e) {
            handle_api_error(req, res, e)
        }
    });

app.get('/api/v1/reservations/list',
    query('only_active').isBoolean(),
    authenticateToken,
    async (req, res) => {
        const only_active = req.query.only_active === 'true';
        const response = await handlers.get_reservations(req.user.account_id, only_active);
        res.send(response);
    }
);