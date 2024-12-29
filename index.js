import TelegramBot from "node-telegram-bot-api"; 
import dotenv from 'dotenv'; 
import fs from 'fs'; 
import path from 'path';
import { sendEmails } from "./assets/services/mail.service.js"; 
import fetch from 'node-fetch'; 
import { parseExcel } from "./assets/scripts/parseExcel.js"; 
import { changeText } from "./assets/scripts/admin.js";

const __dirname = path.dirname(new URL(import.meta.url).pathname); 

dotenv.config();

const bot = new TelegramBot(process.env.TOKEN, { polling: true }); 
const UPLOAD_DIR = path.join(__dirname, 'assets', 'db'); 

if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

bot.on('message', async msg => { 

    const chatId = msg.chat.id; 

    if (msg.text === "/start") { 
        await bot.sendMessage(chatId, "Привет! Я готов работать. Используйте команды:\n\n/start - приветствие\n/file - отправьте Excel-файл, и я его сохраню."); 
        await sendEmails();
    } else if (msg.text === "/file") {
        await bot.sendMessage(chatId, "Отправьте мне Excel-файл, и я его сохраню.");
    } else if (msg.text === "/text"){
        await changeText(bot, chatId)
    }
});



bot.on('document', async (msg) => { 
    const chatId = msg.chat.id; const fileName = msg.document?.file_name || 'unknown.xlsx'; 
    const fileExtension = path.extname(fileName).toLowerCase(); 
    if (fileExtension !== '.xlsx' && fileExtension !== '.xls') {
        return await bot.sendMessage(chatId, 'Неверный формат файла. Пожалуйста, отправьте Excel-файл (.xlsx или .xls).');
    }
    
    try { 
        const file = await bot.getFile(msg.document?.file_id || '');
        const fileUrl = `https://api.telegram.org/file/bot${bot.token}/${file.file_path}`; 
        const filePath = path.join(UPLOAD_DIR, fileName); 
        const response = await fetch(fileUrl); 
        const fileStream = fs.createWriteStream(filePath); 
        response.body?.pipe(fileStream); 
        fileStream.on('finish', () => {
            bot.sendMessage(chatId, `Файл "${fileName}" успешно сохранён.`);
        });
        parseExcel()
    } catch (error) {
        console.error('Ошибка при обработке файла:', error); 
        await bot.sendMessage(chatId, 'Произошла ошибка при обработке файла. Попробуйте ещё раз.');
    }
})
