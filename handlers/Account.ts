import {Router, Request, Response, NextFunction} from 'express';
import {body} from "express-validator";
import {authenticateToken, ICustomRequest, IRequestUser, validateAPI} from "../Middlewares";
import {confirmOTP, forgotPassword, login, resetPassword, signup} from "../ts_handlers";

const router = Router();


router.post('/api/v1/user/login',
    body('phoneNumber').notEmpty(),
    body('password').notEmpty(),
    validateAPI,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            console.log(`POST /api/v1/user/login, req.body: ${JSON.stringify(req.body)}`);
            const { phoneNumber, password } = req.body;
            const response = await login(phoneNumber, password);
            res.send(response);
        } catch (e) {
            next(e);
        }
    });

router.post('/api/v1/user/signup',
    body('phoneNumber').isMobilePhone('ir-IR'),
    body('password').isLength({ min: 3, max: 255 }),
    body('role').isIn(['doctor', 'patient']),
    validateAPI,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            console.log(`POST /api/v1/user/signup, req.body: ${JSON.stringify(req.body)}`);
            const { phoneNumber, password, role } = req.body;
            await signup(phoneNumber, password, role);
            res.send({ response: 'کد یکبار مصرف به شماره تلفن شما پیامک شد.' });
        } catch (e) {
            next(e);
        }
    }
);

router.post('/api/v1/user/signup-otp',
    body('phone_number').isMobilePhone('ir-IR'),
    body('otp').notEmpty(),
    validateAPI,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { phone_number, otp } = req.body;
            const response : IRequestUser = await confirmOTP(phone_number, otp);
            res.send(response);
        } catch (e) {
            next(e);
        }
    }
);

router.post('/api/v1/user/forget_password',
    body('phone_number').isMobilePhone('ir-IR'),
    validateAPI,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { phone_number } = req.body;
            await forgotPassword(phone_number);
            res.send({ response: 'کد تایید برای شماره همراه وارد شده پیامک می شود.' });
        } catch (e) {
            next(e);
        }
    });

router.post('/api/v1/user/reset_password',
    body('password').isLength({ min: 4 }),
    validateAPI,
    authenticateToken,
    async (req: ICustomRequest, res: Response, next: NextFunction) => {
        try {
            const { password } = req.body;
            await resetPassword(req.user.account_id, password);
            res.send({ response: 'تغییر رمز با موفقیت انجام شد.' });
        } catch (e) {
            next(e);
        }
    }
);

export default router;