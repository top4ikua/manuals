import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: "Метод не разрешен" });
    }

    const { key, deviceToken } = req.body;
    const ADMIN_KEY = "semenmanual67521488";

    // 1. Проверка ключа администратора
    if (key === ADMIN_KEY) {
        return res.status(200).json({ success: true });
    }

    try {
        // 2. Ищем обычный ключ в базе данных
        const claimedBy = await kv.get(`auth:${key}`);

        if (claimedBy === null) {
            return res.status(401).json({ error: "Ключ не существует" });
        }

        // 3. Если значение пустое (""), ключ свободен
        if (claimedBy === "") {
            const newToken = crypto.randomUUID(); // Генерируем токен устройства
            await kv.set(`auth:${key}`, newToken); // Записываем токен за этим ключом
            return res.status(200).json({ success: true, token: newToken });
        }

        // 4. Если ключ уже занят, сверяем токен устройства
        if (claimedBy === deviceToken) {
            return res.status(200).json({ success: true });
        } else {
            return res.status(403).json({ error: "Этот ключ уже активирован на другом устройстве" });
        }
    } catch (error) {
        return res.status(500).json({ error: "Внутренняя ошибка сервера" });
    }
}
