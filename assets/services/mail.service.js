import nodemailer from 'nodemailer'
import * as fs from 'fs'
import emails from '../db/emails.json' with {type: "json"}
import senderAccounts from '../db/clients.json' with {type: "json"}
const senderAccounts = require('./senders.json'); 

let emailCounter = 0;
let senderIndex = 0;

function createTransporter(account) {
    return nodemailer.createTransport({
        service: 'gmail', // Замените на нужный сервис
        auth: {
            user: account.email,
            pass: account.password,
        },
    });
}

async function sendEmails() {
    try {
        for (let i = 0; i < emails.length; i++) {
            // Если отправили 2000 писем, переключаем отправителя
            if (emailCounter % 2000 === 0 && emailCounter !== 0) {
                senderIndex = (senderIndex + 1) % senderAccounts.length;
                console.log(`Сменился отправитель: ${senderAccounts[senderIndex].email}`);
            }

            const transporter = createTransporter(senderAccounts[senderIndex]);

            const mailOptions = {
                from: senderAccounts[senderIndex].email,
                to: emails[i].to,
                subject: emails[i].subject,
                text: emails[i].text,
            };

            await transporter.sendMail(mailOptions);
            console.log(`Письмо отправлено на ${emails[i].to}`);

            emailCounter++;

            await new Promise((resolve) => setTimeout(resolve, 100));
        }

        console.log('Все письма отправлены.');
    } catch (error) {
        console.error('Ошибка при отправке письма:', error);
    }
}

// Запускаем отправку
sendEmails();