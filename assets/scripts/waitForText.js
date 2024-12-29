export async function waitForText(bot, chatId) {
    return new Promise((resolve, reject) => {
        const onMessage = (msg) => {
            if (msg.chat.id === chatId && msg.text) {
                bot.removeListener('message', onMessage); // Убираем слушатель после получения сообщения
                resolve(msg.text); // Сообщение получено, разрешаем промис
                bot.removeListener("message", waitForText);            
}
        };

        bot.on('message', onMessage); 
 
    });
}