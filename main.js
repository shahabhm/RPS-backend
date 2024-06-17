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