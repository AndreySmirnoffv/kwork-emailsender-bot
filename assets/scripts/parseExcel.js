import xlsx from 'xlsx'
import * as fs from 'fs'
const workbook = xlsx.readFile('../db/emails.xlsx');
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName]; 
const emails = xlsx.utils.sheet_to_json(sheet, { header: 1 })
    .flat()
    .filter(email => typeof email === 'string')
    .map(email => ({ email }));

fs.writeFileSync('../db/clients.json', JSON.stringify(emails, null, 2), 'utf-8');

console.log('Email-адреса сохранены в emails.json');
