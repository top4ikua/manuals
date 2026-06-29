import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: "Метод не разрешен" });
    }

    const { key, deviceToken } = req.body;

    try {
        // Ищем ключ в базе данных
        const claimedBy = await kv.get(`auth:${key}`);

        // Ключа нет в базе
        if (claimedBy === null) {
            return res.status(401).json({ error: "Неверный ключ доступа" });
        }

        // Обработка ключа администратора (работает всегда и везде)
        if (claimedBy === "admin") {
            return res.status(200).json({ success: true, type: "admin" });
        }

        // Обработка обычного ключа
        // Ключ никем не занят (пустое значение)
        if (claimedBy === "") {
            // Генерируем уникальный токен для этого устройства
            const newToken = crypto.randomUUID(); 
            // Навсегда записываем этот токен в базу за данным ключом
            await kv.set(`auth:${key}`, newToken); 
            
            return res.status(200).json({ success: true, token: newToken });
        }

        // Ключ уже был использован. Проверяем, совпадает ли токен устройства.
        if (claimedBy === deviceToken) {
            return res.status(200).json({ success: true }); // Это владелец ключа
        } else {
            // Это чужое устройство
            return res.status(403).json({ error: "Этот ключ уже активирован на другом устройстве." });
        }
    } catch (error) {
        return res.status(500).json({ error: "Ошибка сервера при проверке ключа" });
    }
}
