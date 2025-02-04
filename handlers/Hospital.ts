import {body} from "express-validator";
import {ICustomRequest, validateAPI} from "../Middlewares";
import {NextFunction, Response, Router} from "express";

const router = Router();


router.get('/api/v1/hospital/list',
    async (req: ICustomRequest, res: Response, next: NextFunction) => {
        try {
            const { city, latitude, longitude } = req.query;
            const response = await getHospitals(city, latitude, longitude);
            res.send(response);
        } catch (e) {
            next (e);
        }
    });

router.get('/api/v1/hospital/info',
    async (req: ICustomRequest, res: Response, next: NextFunction) => {
        try {
            const { hospitalId } = req.query;
            const response = await getHospitalInfo(hospitalId);
            res.send(response);
        } catch (e) {
            next (e);
        }
    });

export default router;