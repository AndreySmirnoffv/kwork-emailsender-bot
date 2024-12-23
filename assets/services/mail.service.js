import nodemailer from 'nodemailer';
import accounts from '../db/emails.json' with {type: "json"}

let currentAccountIndex = 0; 
let emailCount = 0;

let transport = createTransport(accounts[currentAccountIndex]);

function createTransport(account) {
    console.log(account)
    return nodemailer.createTransport({
        host: "smtp.timeweb.ru",
        port: 2525,
        secure: false,
        auth: {
            user: account.email,
            pass: account.password,
        },
        tls: {
            rejectUnauthorized: false
        }
    }, (error, info) => {
        if (error) {
            console.error("Ошибка отправки письма:", error);
        } else {
            console.log("Письмо отправлено:", info.response);
        }
    });
}
export async function sendEmail(to, subject, text) {
    try {
        while (emailCount < 2000) {
            transport = createTransport(accounts[currentAccountIndex]);

            console.log(`Переключение на аккаунт: ${accounts[currentAccountIndex].email}`);

            await transport.sendMail({
                from: accounts[currentAccountIndex].email,
                to,
                subject,
                text,
            });

            emailCount++;

            console.log(`Письмо отправлено. Всего отправлено: ${emailCount} с аккаунта ${accounts[currentAccountIndex].email}`);

            currentAccountIndex = (currentAccountIndex + 1) % accounts.length;
        }

        console.log('Отправлено 2000 писем. Процесс завершен.');

    } catch (error) {
        console.error("Ошибка при отправке письма:", error);
    }
}

sendEmail("smirnoffa675@gmail.com", "test", "test")