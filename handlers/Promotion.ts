import {authenticateToken, ICustomRequest} from "../Middlewares";
import {NextFunction, Response, Router} from "express";

const router = Router();

router.get('/api/v1/patient/promotions', authenticateToken, async (req: ICustomRequest, res: Response, next: NextFunction) => {
        const {account_id} = req.user;
        try {
            res.send([
                    {
                        title: 'تخفیف ویژه برای تهیه‌ی دستگاه',
                        body: 'شما می‌توانید تا ۳ روز آینده دستگاه پایش سلامت را با تخفیف ويژه خریداری کنید.',
                        type: 'call',
                        actionButton: 'تماس با واحد فروش',
                        actionButtonLink: 'tel:09156289830'
                    }, {
                        title: 'بدون دردسر نوبت ویزیت تهیه کنید!',
                        body: 'شما می‌توانید به سرعت و به صورت آنلاین، از پزشکان ما نوبت بگیرید.',
                        type: 'tick',
                        actionButton: 'جستجو میان پزشکان',
                        actionButtonLink: '/user/patient/doctors'
                    }, {
                        title: 'وارد ربات تلگرامی شوید!',
                        body: 'با استارت کردن ربات تلگرام، می‌توانید یادآورها و هشدارهای مربوط به خودتان را در تلگرام دریافت کنید.',
                        type: 'telegram',
                        actionButton: 'وصل شدن به ربات تلگرام',
                        actionButtonLink: `https://t.me/test_health_alerts_bot?start=${account_id}`
                    }
                ]
            )
        } catch (e) {
            next(e);
        }
    }
);

export default router;