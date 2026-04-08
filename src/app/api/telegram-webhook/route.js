import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req) {
  try {
    const data = await req.json();

    // Check if this is a callback_query (someone clicking an inline button)
    if (data.callback_query) {
      const callbackQuery = data.callback_query;
      const callbackData = callbackQuery.data; // e.g., "confirm:CH-2024-0012"
      const chatId = callbackQuery.message.chat.id;
      const messageId = callbackQuery.message.message_id;

      const [action, referenceId] = callbackData.split(':');

      if (!referenceId) return NextResponse.json({ ok: true });

      const newStatus = action === 'confirm' ? 'CONFIRMED' : 'CANCELLED';
      let table = null;
      let booking = null;

      // Update Prisma Database
      if (referenceId.startsWith("CH-")) {
          booking = await prisma.booking.findUnique({ where: { referenceId } });
          if(booking) await prisma.booking.update({ where: { id: booking.id }, data: { status: newStatus } });
      } else if (referenceId.startsWith("SD-")) {
          booking = await prisma.selfDriveBooking.findUnique({ where: { referenceId } });
          if(booking) await prisma.selfDriveBooking.update({ where: { id: booking.id }, data: { status: newStatus } });
      } else if (referenceId.startsWith("DRV-")) {
          booking = await prisma.driverBooking.findUnique({ where: { referenceId } });
          if(booking) await prisma.driverBooking.update({ where: { id: booking.id }, data: { status: newStatus } });
      }

      if (booking) {
         const token = process.env.TELEGRAM_BOT_TOKEN;
         
         // 1. Answer callback query (stops the loading animation on the button)
         await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                callback_query_id: callbackQuery.id,
                text: `Booking ${referenceId} is now ${newStatus}!`,
                show_alert: false
            })
         });

         // 2. Remove the buttons from the original message so they can't be clicked again
         await fetch(`https://api.telegram.org/bot${token}/editMessageReplyMarkup`, {
             method: 'POST',
             headers: {'Content-Type': 'application/json'},
             body: JSON.stringify({
                 chat_id: chatId,
                 message_id: messageId,
                 reply_markup: { inline_keyboard: [] }
             })
         });

         // 3. Send a follow-up confirmation message in the chat
         await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({
                  chat_id: chatId,
                  text: `${newStatus === 'CONFIRMED' ? '✅' : '❌'} Successfully updated <b>${referenceId}</b> to <b>${newStatus}</b> in Dashboard.`,
                  parse_mode: 'HTML'
              })
         });
      }
    }

    // Always return 200 OK to Telegram so it doesn't retry
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Telegram Webhook Error:", err);
    return NextResponse.json({ ok: false });
  }
}
