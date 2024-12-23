import TelegramBot from "node-telegram-bot-api";
import dotenv from 'dotenv'

dotenv.config({path: "./assets/modules/.env"})

const bot = new TelegramBot(process.env.TOKEN, {polling: true})

bot.on('message', async msg => {
    if(msg.text === "/start"){
        await bot.sendMessage(msg.chat.id, "hello world")
    }
})

bot.on('polling_error', console.log)