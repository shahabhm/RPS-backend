const { SocksProxyAgent } = require('socks-proxy-agent');
const agent = new SocksProxyAgent(process.env.PROXY_ADDRESS);
const { Telegraf } = require('telegraf')

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN, {
    telegram : {
        agent: agent
    }
});

// testing connection
try {
    bot.telegram.getMe().then(botInfo => {
        console.log(botInfo)
        bot.options.username = botInfo.username
    })
} catch (e) {
    console.error(e)
}


// ctx.message.text : /start shahab
// ctx.message.from.id : int
// this function will be called each time someone starts the bot
bot.start(async (ctx) => {
    try {
        // TODO: fix circular dependency
        const handlers = require("./application");
        const account_id = ctx.message.text.split(' ')[1];
        await handlers.connect_telegram(account_id, ctx.message.from.id);
        ctx.reply('با موفقیت به حساب کاربری شما متصل شدی');
    } catch (e) {
        console.log(e);
        ctx.reply('پردازش درخواست با خطا مواجه شد. لطفا بعدا تلاش کنید.')
    }
});

const send_message = function (chat_id, message) {
    console.log(`sending message to ${chat_id}: ${message}`);
    bot.telegram.sendMessage(chat_id, message);
}

bot.launch();

module.exports = {send_message}