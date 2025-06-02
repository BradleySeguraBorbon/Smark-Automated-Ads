import pLimit from 'p-limit';

export async function sendToTelegram(chatId: string, message: string) {
    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    console.log("Telegram Bot Token:", TELEGRAM_BOT_TOKEN);

    const telegramAPIUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

    const params = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: "Markdown" }),
    };

    const response = await fetch(telegramAPIUrl, params);
    if (!response.ok) {
        if (response.status === 429) {
            const data = await response.json();
            const retryAfter = data.parameters?.retry_after || 1;
            console.warn(`Rate limited. Retrying after ${retryAfter} seconds`);
            await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));
            return sendToTelegram(chatId, message);
        }
        throw new Error(`Error sending message: ${response.statusText}`);
    }
}

export async function sendTelegramMessages(chatIds: string[], message: string) {
    const limit = pLimit(30);

    const tasks = chatIds.map(chatId =>
        limit(() => sendToTelegram(chatId, message))
    );

    await Promise.all(tasks);
}