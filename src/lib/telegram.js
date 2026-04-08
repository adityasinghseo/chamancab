export async function sendTelegramNotification(message, referenceId = null) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  
  if (!token || !chatId) {
    console.warn("Telegram Token or Chat ID not configured. Skipping notification.");
    return false;
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  const payload = {
    chat_id: chatId,
    text: message,
    parse_mode: "HTML"
  };

  if (referenceId) {
    payload.reply_markup = {
      inline_keyboard: [
        [
          { text: "✅ Confirm", callback_data: `confirm:${referenceId}` },
          { text: "❌ Cancel", callback_data: `cancel:${referenceId}` }
        ]
      ]
    };
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    
    return response.ok;
  } catch (error) {
    console.error("Error sending Telegram message:", error);
    return false;
  }
}
