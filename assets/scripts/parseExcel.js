import xlsx from 'xlsx'
import * as fs from 'fs'
const workbook = xlsx.readFile('../db/emails.xlsx'); // Укажите путь к вашему файлу
const sheetName = workbook.SheetNames[0]; // Получаем имя первого листа
const sheet = workbook.Sheets[sheetName]; // Данные первого листа
const emails = xlsx.utils.sheet_to_json(sheet, { header: 1 }) // Конвертируем в массив
    .flat() // Делаем одномерный массив
    .filter(email => typeof email === 'string') // Фильтруем только строки
    .map(email => ({ email })); // Преобразуем в объекты вида { email: значение }

// Записываем в JSON-файл
fs.writeFileSync('../db/clients.json', JSON.stringify(emails, null, 2), 'utf-8');

console.log('Email-адреса сохранены в emails.json');
