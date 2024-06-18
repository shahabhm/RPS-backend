DROP TABLE IF EXISTS heart_rate;
DROP TABLE IF EXISTS spo;
DROP TABLE IF EXISTS temperature;
DROP TABLE IF EXISTS location;

DROP TABLE IF EXISTS account;

CREATE TABLE account (
                         id SERIAL PRIMARY KEY,
                         name VARCHAR(255) NOT NULL,
                         phone_number VARCHAR(255) NOT NULL,
                         role UserType NOT NULL
);

CREATE TABLE heart_rate (
                         id SERIAL PRIMARY KEY,
                         account_id INTEGER REFERENCES account(id),
                         heart_rate INTEGER NOT NULL,
                         created_at TIMESTAMP NOT NULL
);

INSERT INTO account (name, phone_number, role) VALUES ('Alice', '123-456-7890', 'PATIENT');
INSERT INTO account (name, phone_number, role) VALUES ('Bob', '123-456-7891', 'DOCTOR');
INSERT INTO account (name, phone_number, role) VALUES ('Charlie', '123-456-7892', 'CAREGIVER');
INSERT INTO account (name, phone_number, role) VALUES ('Jack', '123-456-7893', 'ADMINISTRATOR');

INSERT INTO heart_rate (account_id, heart_rate, created_at) VALUES (1, 60, '2018-03-09 11:00:00.000');
INSERT INTO heart_rate (account_id, heart_rate, created_at) VALUES (1, 70, '2018-03-09 11:01:00.000');
INSERT INTO heart_rate (account_id, heart_rate, created_at) VALUES (1, 80, '2018-03-09 11:02:00.000');



CREATE TABLE spo (
                            id SERIAL PRIMARY KEY,
                            account_id INTEGER REFERENCES account(id),
                            spo2 FLOAT NOT NULL,
                            created_at TIMESTAMP NOT NULL
);

INSERT INTO spo (account_id, spo2, created_at) VALUES (1, 10, '2018-03-09 11:00:00.000');
INSERT INTO spo (account_id, spo2, created_at) VALUES (1, 11, '2018-03-09 11:00:01.000');
INSERT INTO spo (account_id, spo2, created_at) VALUES (1, 12, '2018-03-09 11:00:02.000');


CREATE TABLE temperature
(
                            id         SERIAL PRIMARY KEY,
                            account_id INTEGER REFERENCES account (id),
                            temperature FLOAT   NOT NULL,
                            created_at TIMESTAMP NOT NULL
);

INSERT INTO temperature (account_id, temperature, created_at) VALUES (1, 38, '2018-03-09 11:00:00.000');
INSERT INTO temperature (account_id, temperature, created_at) VALUES (1, 39, '2018-03-09 11:00:01.000');
INSERT INTO temperature (account_id, temperature, created_at) VALUES (1, 40, '2018-03-09 11:00:02.000');

CREATE TABLE location
(
    id         SERIAL PRIMARY KEY,
    account_id INTEGER REFERENCES account (id),
    latitude FLOAT   NOT NULL,
    longitude FLOAT NOT NULL,
    created_at TIMESTAMP NOT NULL
);

INSERT INTO location (account_id, latitude, longitude, created_at) VALUES (1, 38, 53, '2018-03-09 11:00:00.000');
INSERT INTO location (account_id, latitude, longitude, created_at) VALUES (1, 38, 53, '2018-03-09 11:00:01.000');
INSERT INTO location (account_id, latitude, longitude, created_at) VALUES (1, 38, 53, '2018-03-09 11:00:02.000');