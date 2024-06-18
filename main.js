const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = 3000
const db = require('./db')
const {application} = require("express");
const handlers = require('./application')

app.use(bodyParser.urlencoded({ extended: false }))

app.use(bodyParser.json())

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.post('/login', (req, res) => {
    res.send('Login Success')
})
// example signup route

app.post('/signup', (req, res) => {
    console.log(req.body);
    res.send('Signup Success');
})

app.post('/send_heart_rate', (req, res) => {
    console.log(req.body);
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

