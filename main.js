const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors');
const app = express()
const port = 3000
const db = require('./db')
const {application} = require("express");
const handlers = require('./application')
const {generateAccessToken, authenticateToken} = require('./jwt')
app.use(bodyParser.urlencoded({extended: false}))

app.use(bodyParser.json())

app.use(cors())

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

app.post("/subscribe", async (req, res) => {
    console.log(req.body);
    const subscription = req.body;
    await handlers.subscribe_push(1, subscription);
    res.send({result: "OK"});
});

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.post('/signup', (req, res) => {
    res.send('Signup Success');
})

app.post('/register_patient', authenticateToken, async (req, res) => {
    const {name, height, age, conditions} = req.body;
    await handlers.register_patient(req.user, name, age, 180, conditions);
})

app.post('/send_heart_rate', (req, res) => {
    handlers.record_heart_rate(req.body);
    res.send("OK");
});

app.post('/get_heart_rate', async (req, res) => {
    const {account_id} = req.body;
    const response = await handlers.get_heart_rate(account_id);
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

app.post('/add_notes', async (req, res) => {
    const {patient_id, note, image} = req.body;
    const response = await handlers.add_notes(patient_id, note, image);
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

app.post('/get_prescriptions', authenticateToken, async (req, res) => {
    const {patient_id} = req.body;
    const response = await handlers.get_patient_prescriptions(patient_id);
    res.send(response);
});

app.post('/add_prescription', authenticateToken, async (req, res) => {
    const {patient_id, prescriptions} = req.body;
    const response = await handlers.add_prescription(patient_id, prescriptions);
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

app.post('/login', (req, res) => {
    const token = generateAccessToken({account_id: req.body.username});
    res.json(token);
});