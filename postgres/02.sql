DROP TABLE IF EXISTS parameter_limit;
DROP TABLE IF EXISTS parameter;
DROP TABLE IF EXISTS note;
DROP TABLE IF EXISTS patient_condition;
DROP TABLE IF EXISTS doctor_patient;
DROP TABLE IF EXISTS doctor;
DROP TABLE IF EXISTS patient_prescription;
DROP TABLE IF EXISTS reminder;
DROP TABLE IF EXISTS push_subscription;
DROP TABLE IF EXISTS patient;
DROP TABLE IF EXISTS credentials;
DROP TABLE IF EXISTS account;

CREATE TABLE account
(
    id           SERIAL PRIMARY KEY,
    name         VARCHAR(255) NOT NULL,
    phone_number VARCHAR(255) NOT NULL,
    role         UserType     NOT NULL
);

CREATE TABLE patient
(
    id     SERIAL PRIMARY KEY,
    age    INTEGER,
    height INTEGER,
    name   VARCHAR(255) NOT NULL
);

INSERT INTO patient (age, height, name)
values (24, 180, 'Shahab');

CREATE TABLE parameter
(
    id         SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patient (id),
    parameter  varchar(255),
    value      INTEGER   NOT NULL,
    created_at TIMESTAMP NOT NULL
);

INSERT INTO account (name, phone_number, role)
VALUES ('Bob', '123-456-7891', 'DOCTOR');
INSERT INTO account (name, phone_number, role)
VALUES ('Charlie', '123-456-7892', 'CAREGIVER');

INSERT INTO parameter (patient_id, value, parameter, created_at)
VALUES (1, 60, 'HEART_RATE', '2018-03-09 11:00:00.000');
INSERT INTO parameter (patient_id, value, parameter, created_at)
VALUES (1, 70, 'HEART_RATE', '2018-03-09 11:01:00.000');
INSERT INTO parameter (patient_id, value, parameter, created_at)
VALUES (1, 80, 'HEART_RATE', '2018-03-09 11:02:00.000');

CREATE TABLE note
(
    id          SERIAL PRIMARY KEY,
    patient_id  INTEGER REFERENCES patient (id),
    note        TEXT         NOT NULL,
    image       TEXT,
    created_at  TIMESTAMP    NOT NULL,
    sender_name VARCHAR(255) NOT NULL,
    note_title  VARCHAR(255) NOT NULL
);

CREATE TABLE patient_condition
(
    id         SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patient (id),
    condition  TEXT NOT NULL
);

CREATE TABLE doctor_patient
(
    id         SERIAL PRIMARY KEY,
    doctor_id  INTEGER REFERENCES account (id),
    patient_id INTEGER REFERENCES patient (id)
);

INSERT INTO doctor_patient (doctor_id, patient_id)
VALUES (1, 1);
INSERT INTO patient_condition (patient_id, condition)
values (1, 'Diabetes');
INSERT INTO patient_condition (patient_id, condition)
values (1, 'Obesity');

CREATE TABLE patient_prescription
(
    patient_id   INTEGER REFERENCES patient (id),
    prescription TEXT NOT NULL,
    dosage  TEXT NOT NULL,
    amount  INTEGER NOT NULL,
    PRIMARY KEY (patient_id, prescription)
);

CREATE TABLE reminder
(
    id         SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patient (id) NOT NULL,
    reminder   TEXT                            NOT NULL,
    date       TIMESTAMP                       NOT NULL,
    created_at TIMESTAMP
);

INSERT INTO reminder (patient_id, reminder, date, created_at)
VALUES (1, 'Take medicine', '2018-03-09 11:00:00.000', '2018-03-09 11:00:00.000');


CREATE TABLE push_subscription
(
    id         SERIAL PRIMARY KEY,
    account_id INTEGER REFERENCES account (id) UNIQUE,
    endpoint   TEXT NOT NULL,
    p256dh     TEXT NOT NULL,
    auth       TEXT NOT NULL
);

CREATE TABLE credentials
(
    account_id INTEGER REFERENCES account (id) UNIQUE,
    username   TEXT NOT NULL,
    password   TEXT NOT NULL,
    PRIMARY KEY (account_id)
);

CREATE TABLE parameter_limit
(
    patient_id  INTEGER REFERENCES patient (id),
    parameter   VARCHAR(255) NOT NULL,
    lower_limit INTEGER      NOT NULL,
    upper_limit INTEGER      NOT NULL,
    PRIMARY KEY (patient_id, parameter)
);