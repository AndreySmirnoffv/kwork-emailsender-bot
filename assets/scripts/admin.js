import { waitForText } from "./waitForText.js"
import * as fs from 'fs'
import text from '../db/text.json' with {type: "json"}


export async function changeText(bot, chatId){
    await bot.sendMessage(chatId, "Пришлите мне текст который хотите проставить")

    const newText = await waitForText(bot, chatId)

    text[0].text = newText

    fs.writeFileSync('./assets/db/text.json', JSON.stringify(text, null, '\t'))

    return await bot.sendMessage(chatId, "Данные были сохранены")
}