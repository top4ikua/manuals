import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    // Простая защита, чтобы никто чужой не запустил скрипт
    if (req.query.pw !== "semenmanual67521488") {
        return res.status(401).send("Доступ запрещен");
    }

    // Вставьте сюда массив из ваших 250 сгенерированных ключей
    const keys = [
        "aB3x-9fK2-pL1q",
        "X7yT-mN4v-1QwE"
        // ... остальные ключи
    ];

    try {
        // Записываем каждый ключ в базу со свободным значением ("")
        for (let k of keys) {
            await kv.set(`auth:${k}`, "");
        }
        res.status(200).send(`Успешно загружено ${keys.length} ключей в базу данных.`);
    } catch (error) {
        res.status(500).send("Ошибка при загрузке ключей.");
    }
}
