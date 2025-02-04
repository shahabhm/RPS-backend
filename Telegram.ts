import { SocksProxyAgent } from 'socks-proxy-agent';
import { Telegraf, Context } from 'telegraf';
import {Message} from '@telegraf/types/message';

const agent = new SocksProxyAgent(process.env.PROXY_ADDRESS);
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN, {
    telegram: {
        agent: agent
    }
});

interface ITelegram {
    sendMessage(chat_id: string, message: string): void;
    startBot(callbacks: ITelegramCallbacks): Promise<void>;
}

interface ITelegramCallbacks {
    startCallback(account_id: string, chat_id: string): Promise<void>;
}

let applicationCallbacks: ITelegramCallbacks;

export const Telegram: ITelegram = {
    sendMessage: async (chat_id: string, message: string): Promise<Message.TextMessage> => {
        console.log(`sending message to ${chat_id}: ${message}`);
        try {
            return await bot.telegram.sendMessage(chat_id, message);
        } catch (err) {
            console.error(err);
        }
    },

    startBot: async (callbacks: ITelegramCallbacks): Promise<void> => {
        applicationCallbacks = callbacks;
        bot.launch().catch(e => {
            console.error(e);
        });

        // testing connection
        bot.telegram.getMe().then(botInfo => {
            console.log(botInfo);
        }).catch(err => {
            console.log(err);
        });
    }
};

// this function will be called each time someone starts the bot
bot.start(async (ctx: Context): Promise<void> => {
    try {
        // @ts-ignore - the IDE may not suggest this, but message does have text
        const account_id: string = ctx.message.text.split(' ')[1];
        if (!account_id) {
            ctx.reply('لطفا از داخل وبسایت وارد ربات شوید.');
            return;
        }
        await applicationCallbacks.startCallback(account_id, ctx.message.from.id.toString());
        // It may not be suggested by the IDE, but this does return a promise.
        ctx.reply('با موفقیت به حساب کاربری شما متصل شدی').catch(err => {
            console.error(err);
        });
    } catch (e) {
        console.log(e);
        ctx.reply('پردازش درخواست با خطا مواجه شد. لطفا بعدا تلاش کنید.').catch(err => {
            console.error(err);
        });
    }
});