import {authenticateToken, ICustomRequest} from "../Middlewares";
import {NextFunction, Response, Router} from "express";
import {createChat, deleteMessage, getChatList, getChatMessages, sendMessage} from "../ts_handlers";

const router = Router();


router.post('/api/v1/user/chats/send', authenticateToken, async (req: ICustomRequest, res: Response, next: NextFunction) => {
    try {
        const sender_id = req.user.account_id;
        const {chat_id, text, image_name} = req.body;
        const message = await sendMessage(sender_id, chat_id, text, image_name);
        res.send(message);
    } catch (err) {
        next(err);
    }
});

router.get('/api/v1/user/chats/messages', authenticateToken, async (req: ICustomRequest, res: Response, next: NextFunction) => {
    try {
        const {account_id} = req.user;
        const {chatId} = req.query;
        const messages = await getChatMessages(chatId as string, account_id);
        res.send({
            messages,
            yourId: req.user.account_id
        });
    } catch (err) {
        next(err);
    }
});

router.post('/api/v1/user/chats', authenticateToken, async (req: ICustomRequest, res: Response, next: NextFunction) => {
    try {
        const {account_id} = req.user;
        const {doctor_id} = req.body;
        const response = await createChat([account_id, doctor_id]);
        res.send(response);
    } catch (err) {
        next(err);
    }
});

router.get('/api/v1/user/chats', authenticateToken, async (req: ICustomRequest, res: Response, next: NextFunction) => {
    try {
        const {account_id} = req.user;
        const {unread} = req.query;
        const response = await getChatList(account_id, unread === "true");
        res.send(response);
    } catch (err) {
        next(err);
    }
});

router.delete('/api/v1/user/chats/message', authenticateToken, async (req: ICustomRequest, res: Response, next: NextFunction) => {
    try {
        const {messageId} = req.body;
        const response = await deleteMessage(messageId);
        res.send(response);
    } catch (err) {
        next(err);
    }
});

export default router;