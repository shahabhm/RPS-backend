import {NextFunction, Response, Router} from "express"
import {authenticateToken, ICustomRequest} from "../Middlewares";
import {getUserNotifications} from "../ts_handlers";

const router = Router();

router.get('/api/v1/notification',
    authenticateToken,
    async (req: ICustomRequest, res: Response, next: NextFunction) => {
        try {
            const notifications = await getUserNotifications(req.user.account_id);
            res.send(notifications);
        } catch (err) {
            next(err);
        }
    });

export default router;