const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors');
const multer = require("multer");
const upload = multer({dest: "uploads/"});
const app = express()
const port = 3000
const db = require('./db')
const {application} = require("express");
const handlers = require('./application')
const {generateAccessToken, authenticateToken} = require('./jwt')
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

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.post('/signup', async (req, res) => {
    const {username, password, role, name, phone_number} = req.body;
    const response = await handlers.signup(username, password, role, name, phone_number);
    res.json(response);
});

app.post('/register_patient', authenticateToken, async (req, res) => {
    const {name, height, age, city, conditions, birthdate} = req.body;
    const response = await handlers.register_patient(req.user, name, age, height, conditions, city, birthdate);
    res.send(response);
})

app.post('/get_patient_parameter', async (req, res) => {
    const {patient_id, parameter} = req.body;
    const response = await handlers.get_patient_parameter(patient_id, parameter);
    res.send(response);
});

app.post('/send_spo', async (req, res) => {
    const {account_id, spo} = req.body;
    const response = await handlers.record_spo(account_id, spo);
    res.send(response);
});

app.post('/get_spo', async (req, res) => {
    const {account_id} = req.body;
    const response = await handlers.get_spo(account_id);
    res.send(response);
});

app.post('/send_location', async (req, res) => {
    const {account_id, latitude, longitude} = req.body;
    const response = await handlers.send_location(account_id, latitude, longitude);
    res.send(response);
});

app.post('/get_location', async (req, res) => {
    const {account_id} = req.body;
    const response = await handlers.get_location(account_id);
    res.send(response);
});
app.post('/send_temperature', async (req, res) => {
    const {account_id, temperature} = req.body;
    const response = await handlers.send_temperature(account_id, temperature);
    res.send(response);
});

app.post('/get_temperature', async (req, res) => {
    const {account_id} = req.body;
    const response = await handlers.get_temperature(account_id);
    res.send(response);
});

app.post('/get_patient_status', async (req, res) => {
    const {account_id} = req.body;
    const response = await handlers.get_patient_status(account_id);
    res.send(response);
});

app.post('/add_notes', upload.single("image"), async (req, res) => {
    const image = req.file.filename;
    const {patient_id, note, note_title} = req.body;
    const response = await handlers.add_notes('1', patient_id, note, image, note_title);
    res.send(response);
});

app.post('/get_notes', authenticateToken, async (req, res) => {
    const {patient_id} = req.body;
    const response = await handlers.get_notes(patient_id);
    res.send(response);
});

app.post('/get_heart_rates', authenticateToken, async (req, res) => {
    const {patient_id} = req.body;
    const heart_rates = await handlers.get_heart_rate(patient_id);
    res.send(heart_rates);
})


app.post('/get_patients_list', authenticateToken, async (req, res) => {
    const account_id = req.user.account_id;
    const response = await handlers.get_patients_list(account_id);
    console.log(response);
    res.send(response);
})

app.post('/get_patient_overview', authenticateToken, async (req, res) => {
    const {patient_id} = req.body;
    const response = await handlers.get_patient_overview(patient_id);
    // sleep for one second
    await new Promise(resolve => setTimeout(resolve, 1000));
    res.send(response);
})

app.get('/get_condition_names', (req, res) => {
    res.send(
        [
            {
                value: 'Asthma',
                label: 'آسم'
            },
            {
                value: 'Diabetes',
                label: 'دیابت'
            },
            {
                value: 'Obesity',
                label: 'چاقی'
            },
            {
                value: 'Cancer',
                label: 'سرطان'
            }
        ]
    );
});


app.get('/get_meds_names', (req, res) => {
    res.send(
        [
            {
                value: 'ACT',
                label: 'استامینوفن'
            },
            {
                value: 'PNC',
                label: 'پنی سیلین'
            },
            {
                value: 'IBP',
                label: 'ایبوپروفن'
            }
        ]
    );
});

app.get('/get_parameters_names', (req, res) => {
    res.send(
        [
            {
                value: 'HEART_RATE',
                label: 'ضربان قلب'
            },
            {
                value: 'BLOOD_SUGAR',
                label: 'قند خون'
            },
            {
                value: 'BLOOD_PRESSURE',
                label: 'فشار خون'
            }
        ]
    );
});

app.post('/send_parameter', authenticateToken, async (req, res) => {
    const {parameter, value, date, patient_id} = req.body;
    const response = await handlers.send_parameter(patient_id, parameter, value, date);
    res.send(response);
});

app.post('/get_patient_parameters', authenticateToken, async (req, res) => {
    const {patient_id} = req.body;
    const response = await handlers.get_patient_parameters(patient_id);
    res.json(response);
});

app.post('/set_parameter_limits', authenticateToken, async (req, res) => {
    const {patient_id, parameter, lower_limit, upper_limit} = req.body;
    const response = await handlers.set_parameter_limits(patient_id, parameter, lower_limit, upper_limit);
    res.send(response);
});

app.post('/get_prescriptions', authenticateToken, async (req, res) => {
    const {patient_id} = req.body;
    const response = await handlers.get_patient_prescriptions(patient_id);
    res.send(response);
});

app.post('/add_prescription', authenticateToken, async (req, res) => {
    const {patient_id, prescriptions, dosage, amount} = req.body;
    const response = await handlers.add_prescription(patient_id, prescriptions, dosage, amount);
    res.send(response);
});

app.post('/delete_prescription', authenticateToken, async (req, res) => {
    const {patient_id, prescription} = req.body;
    const response = await handlers.delete_prescription(patient_id, prescription);
    res.send(response);
});

app.post('/delete_notes', authenticateToken, async (req, res) => {
    const {id} = req.body;
    const response = await handlers.delete_note(id);
    res.send(response);
});

app.post('/add_reminder', authenticateToken, async (req, res) => {
    const {patient_id, reminderText: reminder, date} = req.body;
    const response = await handlers.add_reminder(patient_id, reminder, date);
    res.send(response);
})

app.post('/get_reminders', authenticateToken, async (req, res) => {
    const {patient_id} = req.body;
    const response = await handlers.get_reminders(patient_id);
    res.send(response);
});

app.post('/delete_reminder', authenticateToken, async (req, res) => {
    const {id} = req.body;
    const response = await handlers.delete_reminder(id);
    res.send(response);
});

app.post('/login', async (req, res) => {
    const {username, password} = req.body;
    const token = await handlers.login(username, password);
    res.json(token);
});

app.get('/uploads/:file', async (req, res) => {
    const {file} = req.params;
    res.sendFile(__dirname + '/uploads/' + file);
})

app.post('/get_hospitals', async (req, res) => {
    res.send([
        {
            lat: 35.70,
            lng: 51.41,
            name: 'درمانگاه یادگار',
            address: 'بزرگراه یادگار امام، پلاک ۲۱',
            website: 'https://yadegarclinic.com/',
            image: 'http://localhost:3000/uploads/yadegar.png'
        },
        {
            lat: 35.80,
            lng: 51.51,
            name: 'بیمارستان پیامبران',
            address: 'بزرگراه یادگار امام، پلاک ۲۱',
            website: 'https://sinahospital.tums.ac.ir/',
            image: 'http://localhost:3000/uploads/payambar.png'
        },
        {
            lat: 35.60,
            lng: 51.31,
            name: 'بیمارستان سینا',
            address: 'بزرگراه یادگار امام، پلاک ۲۱',
            website: 'https://sinahospital.tums.ac.ir/',
            image: 'http://localhost:3000/uploads/sina.png'
        }
    ])
})