import nodemailer from 'nodemailer';
import * as fs from 'fs';
import juice from 'juice';
import senderAccounts from '../db/emails.json' with { type: "json" };
import emails from '../db/clients.json' with { type: "json" };

let emailCounter = 0;
let senderIndex = 0;

function createTransporter(account) {
    if (!account || !account.email || !account.password) {
        console.error('Ошибка: Учетные данные отсутствуют или некорректны:', account);
        throw new Error('Отсутствуют учетные данные для аутентификации');
    }

    return nodemailer.createTransport({
        host: 'smtp.timeweb.ru',
        port: 465,
        secure: true,
        auth: {
            user: account.email,
            pass: account.password,
        },
    });
}

export async function sendEmails() {
    try {
        const htmlContent = juice(fs.readFileSync("./index.html", 'utf8'));

        for (let i = 0; i < emails.length; i++) {
            if (emailCounter % 2000 === 0 && emailCounter !== 0) {
                senderIndex = (senderIndex + 1) % senderAccounts.length;
                console.log(`Сменился отправитель: ${senderAccounts[senderIndex].email}`);
            }

            console.log(`Используется отправитель: ${JSON.stringify(senderAccounts[senderIndex])}`);
            const transporter = createTransporter(senderAccounts[senderIndex]);

            const mailOptions = {
                from: senderAccounts[senderIndex].email,
                to: emails[i].email,
                subject: "custom",
                html: htmlContent,
            }

            await transporter.sendMail(mailOptions);
            console.log(`Письмо отправлено на ${emails[i].email}`);

            emailCounter++;

            await new Promise((resolve) => setTimeout(resolve, 100));
        }

        console.log('Все письма отправлены.');
    } catch (error) {
        console.error('Ошибка при отправке письма:', error);
    }
}


