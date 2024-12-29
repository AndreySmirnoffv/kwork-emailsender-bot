import TelegramBot from "node-telegram-bot-api"; 
import dotenv from 'dotenv'; 
import fs from 'fs'; 
import path, { parse } from 'path';
import { sendEmails } from "./assets/services/mail.service.js"; 
import fetch from 'node-fetch'; 
import { parseExcel } from "./assets/scripts/parseExcel.js"; 
import { changeText } from "./assets/scripts/admin.js";

const __dirname = path.dirname(new URL(import.meta.url).pathname); 

dotenv.config();

const bot = new TelegramBot(process.env.TOKEN, { polling: true }); 
const UPLOAD_DIR = path.join(__dirname, 'assets', 'db'); 
const commands = JSON.parse(fs.readFileSync('./assets/db/commands/commands.json'))

bot.setMyCommands(commands)

if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

bot.on('message', async msg => { 
    const chatId = msg.chat.id; 

    if(chatId !== 513384114){
        return
    }

    if (msg.text === "/start") { 
        await bot.sendMessage(chatId, "Привет! Я готов работать. Используйте команды:\n\n/start - приветствие\n/file - отправьте Excel-файл, и я его сохраню.\n/send - Начать отправку имейлов.\n/text - отправьте мне текст для письма и я его внесу в имейл"); 
    } else if (msg.text === "/file") {
        await bot.sendMessage(chatId, "Отправьте мне Excel-файл, и я его сохраню.");
    } else if (msg.text === "/text"){
        await changeText(bot, chatId)
    } else if(msg.text === "/send"){
        await sendEmails();
    }
});





bot.on('document', async (msg) => {
    const chatId = msg.chat.id;
    const fileName = msg.document?.file_name || 'unknown.file';
    const fileExtension = path.extname(fileName).toLowerCase();
    const allowedExtensions = ['.xlsx', '.xls', '.html', '.htm'];

    if(chatId !== 513384114){
        return
    }

    if (!allowedExtensions.includes(fileExtension)) {
        return await bot.sendMessage(chatId, 'Неверный формат файла. Пожалуйста, отправьте файл с одним из следующих расширений: .xlsx, .xls, .html, .htm.');
    }

    try {
        const file = await bot.getFile(msg.document?.file_id || '');
        const fileUrl = `https://api.telegram.org/file/bot${bot.token}/${file.file_path}`;

        const filePath = fileExtension === '.xlsx' || fileExtension === '.xls'
            ? path.join('./assets/db/', fileName)
            : path.join('./', fileName);

        const response = await fetch(fileUrl);
        const fileStream = fs.createWriteStream(filePath);
        response.body?.pipe(fileStream);

        fileStream.on('finish', () => {
            bot.sendMessage(chatId, `Файл "${fileName}" успешно сохранён в ${fileExtension === '.xlsx' || fileExtension === '.xls' ? 'папку Excel' : 'основную директорию'}.`);
            
            if (fileExtension === '.xlsx' || fileExtension === '.xls') {
                try {
                    parseExcel(filePath);
                } catch (err) {
                    console.error('Ошибка обработки Excel-файла:', err);
                    bot.sendMessage(chatId, 'Произошла ошибка при обработке Excel-файла.');
                }
            }
        });

        fileStream.on('error', (err) => {
            console.error('Ошибка при записи файла:', err);
            bot.sendMessage(chatId, 'Произошла ошибка при сохранении файла.');
        });
    } catch (error) {
        console.error('Ошибка при обработке файла:', error);
        await bot.sendMessage(chatId, 'Произошла ошибка при обработке файла. Попробуйте ещё раз.');
    }
});


bot.on('polling_error', console.error)