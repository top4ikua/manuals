function generateKeys() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let keys = [];
    // Нам нужно 251 уникальный ключ
    while(keys.length < 251) {
        let key = '';
        for(let j=0; j<3; j++) {
            for(let k=0; k<4; k++) {
                key += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            if(j<2) key += '-';
        }
        // Проверяем на уникальность (чтобы случайно не сгенерировать два одинаковых)
        if (!keys.includes(key)) {
            keys.push(key);
        }
    }

    // Первый ключ делаем админским
    const adminKey = keys[0];
    const userKeys = keys.slice(1);

    // Формируем готовый код для файла init.js
    let code = `import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    // ВАЖНО: Обязательно сохраните этот админ-ключ в надежном месте!
    const ADMIN_KEY = "${adminKey}";
    
    // Защита скрипта инициализации
    if (req.query.pw !== ADMIN_KEY) {
        return res.status(401).send("Доступ запрещен");
    }

    const userKeys = [
`;
    // Добавляем все пользовательские ключи в массив
    userKeys.forEach((key, index) => {
        code += `        "${key}"${index < userKeys.length - 1 ? ',' : ''}\n`;
    });

    code += `    ];

    try {
        // Создаем админ-ключ в базе (помечаем его как admin)
        await kv.set(\`auth:\${ADMIN_KEY}\`, "admin");

        // Создаем 250 пользовательских ключей (свободных)
        for (let k of userKeys) {
            await kv.set(\`auth:\${k}\`, "");
        }
        
        res.status(200).send(\`Успешно загружено \${userKeys.length} пользовательских ключей и 1 ключ администратора.\`);
    } catch (error) {
        res.status(500).send("Ошибка при загрузке ключей.");
    }
}`;

    // Выводим результат в консоль, чтобы его было удобно скопировать
    console.log("=== СКОПИРУЙТЕ ВЕСЬ ТЕКСТ НИЖЕ В ФАЙЛ api/init.js ===");
    console.log(code);
    console.log("=== КОНЕЦ ФАЙЛА ===");
    console.log(`\nВАШ НОВЫЙ КЛЮЧ АДМИНИСТРАТОРА: ${adminKey}`);
    console.log("Сохраните его, он понадобится для запуска скрипта инициализации и входа в систему!");
}

generateKeys();
