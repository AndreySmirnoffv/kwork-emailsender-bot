import nodemailer from "nodemailer";
import emails from "../db/emails.json" assert { type: "json" };
import clientEmails from "../db/clients.json" assert { type: "json" };

// Настройки
const EMAILS_PER_ACCOUNT = 2000; // Сколько писем отправлять с одного аккаунта
let currentEmailIndex = 0; // Индекс текущего аккаунта
let emailCount = 0; // Счетчик отправленных писем с текущего аккаунта

// Функция отправки письма
async function sendEmail(recipient, transporter) {
  try {
    const info = await transporter.sendMail({
      from: `"По Москве" <${emails[currentEmailIndex].email}>`, // Имя отправителя
      to: recipient.email,
      subject: "Ваше письмо от По Москве",
      text: `Здравствуйте, ${recipient.email}! Это тестовое письмо. Спасибо за внимание!`,
    });
    console.log(`Письмо отправлено: ${info.messageId} -> ${recipient.email}`);
  } catch (error) {
    console.error(`Ошибка при отправке на ${recipient.email}: ${error.message}`);
  }
}

// Функция создания нового транспортера
function createTransporter() {
  const { email, password } = emails[currentEmailIndex];
  return nodemailer.createTransport({
    host: "smtp.timeweb.ru", // Адрес SMTP-сервера Timeweb
    port: 587, // Порт SMTP
    secure: false, // Используется TLS (false для Timeweb)
    auth: {
      user: email,
      pass: password,
    },
  });
}

// Основной процесс
(async () => {
  if (emails.length === 0 || clientEmails.length === 0) {
    console.log("Нет доступных аккаунтов или получателей для отправки писем.");
    return;
  }

  let transporter = createTransporter();

  for (const recipient of clientEmails) {
    await sendEmail(recipient, transporter);

    emailCount++;

    // Переключение аккаунта после EMAILS_PER_ACCOUNT писем
    if (emailCount >= EMAILS_PER_ACCOUNT) {
      emailCount = 0; // Сброс счетчика
      currentEmailIndex++; // Переход к следующему аккаунту

      if (currentEmailIndex >= emails.length) {
        console.log("Закончились аккаунты для отправки писем.");
        break;
      }

      console.log(`Переключаемся на новый аккаунт: ${emails[currentEmailIndex].email}`);
      transporter = createTransporter(); // Создаем новый транспортер
    }
  }

  console.log("Рассылка завершена.");
})();
