import xlsx from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';
import clients from '../db/clients.json' with  {type: 'json'}
import fs from 'fs'


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, '../db/emails.xlsx');

export async function parse() {
  try {
    console.log(`Чтение файла: ${filePath}`);
    const workbook = xlsx.readFile(filePath);

    const sheetName = workbook.SheetNames[0];
    console.log(`Лист найден: ${sheetName}`);

    const worksheet = workbook.Sheets[sheetName];

    const jsonData = xlsx.utils.sheet_to_json(worksheet, {
      header: ['email'],
    });

    console.log('Данные листа:', jsonData);

    const emailArray = jsonData.map((row) => {
      if (row.email) {
        clients.push({
            email: row.email,
        })

        fs.writeFileSync('../db/clients.json', JSON.stringify(clients, null, '\t'))
        return { email: row.email };
      }
      return null;
    }).filter(Boolean); 

    
    console.log(emailArray)
    return emailArray;
  } catch (error) {
    console.error('Ошибка парсинга Excel:', error.message);
  }
}

parse();
