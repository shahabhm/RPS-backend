import jwt from 'jsonwebtoken';
import {Request, Response, NextFunction} from 'express';
import {validationResult} from "express-validator";
import {errors} from "./errors";

export interface IRequestUser {
    account_id: string;
    role: string;
    doctor_id? : string;
    patient_id? : string;
    token? : string;
}

export interface ICustomRequest extends Request {
    user?: IRequestUser;
}


// generates the jwt token with account_id and role
export function generateAccessToken(payload: IRequestUser): IRequestUser {
    return {
        token: jwt.sign(payload, process.env.JWT_SECRET as string, {expiresIn: '3h'}),
        account_id: payload.account_id,
        role: payload.role,
        doctor_id: payload.doctor_id,
        patient_id: payload.patient_id
    }
}

export function authenticateToken(req: ICustomRequest, res: Response, next: NextFunction): void {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        res.sendStatus(401);
        return;
    }
    jwt.verify(token, process.env.JWT_SECRET as string, (err, user: IRequestUser) => {
        if (err) {
            res.sendStatus(403);
            return;
        }
        req.user = user;
        next();
    });
}

export const validateAPI = (req: Request, res: Response, next: NextFunction): void => {
    const apiValidationResult = validationResult(req);
    if (!apiValidationResult.isEmpty()) {
        res.status(400);
        res.send({ errors: apiValidationResult.array() });
    } else next();
};

export const handleAPIErrors = function (err, req, res, next) {
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
