import TelegramBot from "node-telegram-bot-api";
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { sendEmails } from "./assets/services/mail.service.js";
import fetch from 'node-fetch';

// Получаем путь к текущей директории
const __dirname = path.dirname(new URL(import.meta.url).pathname);

dotenv.config();

const bot = new TelegramBot(process.env.TOKEN, { polling: true });

// Папка для сохранения файлов
const UPLOAD_DIR = path.join(__dirname, 'assets', 'db');

if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Обработчик команд
bot.on('message', async msg => {
    const chatId = msg.chat.id;

    if (msg.text === "/start") {
        bot.sendMessage(chatId, "Привет! Я готов работать. Используйте команды:\n\n/start - приветствие\n/file - отправьте Excel-файл, и я его сохраню.");
        await sendEmails();
    } else if (msg.text === "/file") {
        bot.sendMessage(chatId, "Отправьте мне Excel-файл, и я его сохраню.");
    }
});

// Обработчик для документов
bot.on('document', async (msg) => {
    const chatId = msg.chat.id;

    const fileName = msg.document?.file_name || 'unknown.xlsx';
    const fileExtension = path.extname(fileName).toLowerCase();

    if (fileExtension !== '.xlsx' && fileExtension !== '.xls') {
        bot.sendMessage(chatId, 'Неверный формат файла. Пожалуйста, отправьте Excel-файл (.xlsx или .xls).');
        return;
    }

    try {
        // Получаем ссылку на файл
        const file = await bot.getFile(msg.document?.file_id || '');
        const fileUrl = `https://api.telegram.org/file/bot${bot.token}/${file.file_path}`;

        // Путь для сохранения файла в ./assets/db/
        const filePath = path.join(UPLOAD_DIR, fileName);

        // Скачиваем файл и сохраняем
        const response = await fetch(fileUrl);
        const fileStream = fs.createWriteStream(filePath);
        response.body?.pipe(fileStream);

        // Ждём завершения записи
        fileStream.on('finish', () => {
            bot.sendMessage(chatId, `Файл "${fileName}" успешно сохранён.`);
        });

    } catch (error) {
        console.error('Ошибка при обработке файла:', error);
        bot.sendMessage(chatId, 'Произошла ошибка при обработке файла. Попробуйте ещё раз.');
    }
});
