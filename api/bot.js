import { Telegraf } from 'telegraf';
import { createClient } from '@libsql/client';
import dotenv from 'dotenv';

dotenv.config();

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
const db = createClient({
  url: process.env.TURSO_DB_URL,
  authToken: process.env.TURSO_DB_TOKEN,
});

bot.start((ctx) => {
  ctx.reply('YBS Bus Line Info Bot မှ ကြိုဆိုပါတယ်။ ဘတ်စ်ကားလိုင်းနံပါတ်ကို ရိုက်ထည့်ပြီး ရှာဖွေနိုင်ပါတယ် (ဥပမာ - 1)။');
});

bot.on('text', async (ctx) => {
  const query = ctx.message.text.trim();
  
  try {
    // Search for route
    const routeRes = await db.execute({
      sql: "SELECT * FROM routes WHERE bus_line = ?",
      args: [query]
    });

    if (routeRes.rows.length === 0) {
      return ctx.reply(`စိတ်မရှိပါနဲ့၊ ဘတ်စ်ကားလိုင်း "${query}" ကို ရှာမတွေ့ပါဘူး။`);
    }

    const route = routeRes.rows[0];
    let message = `🚌 *YBS ${route.bus_line}*\n`;
    message += `📍 လိုင်းအမည်: ${route.line_name}\n`;
    message += `🏢 ကုမ္ပဏီ: ${route.agency}\n`;
    message += `🛑 မှတ်တိုင်စုစုပေါင်း: ${route.total_stops}\n`;
    message += `💳 QR Payment: ${route.qr_payment}\n\n`;
    
    // Get first 10 stops as example
    const stopsRes = await db.execute({
      sql: "SELECT * FROM stops WHERE route_id = ? ORDER BY stop_index ASC LIMIT 15",
      args: [route.id]
    });

    if (stopsRes.rows.length > 0) {
      message += `*အစောပိုင်းမှတ်တိုင်အချို့:*\n`;
      stopsRes.rows.forEach(stop => {
        message += `${stop.stop_index}. ${stop.stop_name_mm} (${stop.stop_name_en})\n`;
      });
      message += `\n... နှင့် အခြားမှတ်တိုင်များစွာရှိပါသေးသည်။`;
    }

    ctx.replyWithMarkdown(message);
  } catch (error) {
    console.error(error);
    ctx.reply('အချက်အလက်ရှာဖွေရာမှာ အမှားအယွင်းတစ်ခု ဖြစ်ပေါ်ခဲ့ပါတယ်။ ခေတ္တစောင့်ပြီး ပြန်ကြိုးစားကြည့်ပါ။');
  }
});

// Vercel Webhook handler
export default async (req, res) => {
  try {
    if (req.method === 'POST') {
      await bot.handleUpdate(req.body);
      res.status(200).send('OK');
    } else {
      res.status(200).send('Bot is running...');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Error');
  }
};
