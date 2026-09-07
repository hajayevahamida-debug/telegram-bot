import { Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';
import dotenv from 'dotenv';
import { getPopularRatesMessage, convertCurrency } from './services/currency.js';
import { REGIONS, fetchWeather } from './services/weather.js';
import { mainMenu, weatherMenu, currencyInlineMenu } from './keyboards/menus.js';

// .env faylidan o'zgaruvchilarni yuklash
dotenv.config();

const BOT_TOKEN = process.env.BOT_TOKEN;

if (!BOT_TOKEN || BOT_TOKEN === 'YOUR_BOT_TOKEN_HERE') {
  console.log('\n' + '='.repeat(60));
  console.log('XATOLIK: BOT_TOKEN topilmadi yoki to‘g‘ri kiritilmagan!');
  console.log('1. telegram/.env faylini oching.');
  console.log('2. BOT_TOKEN= ga BotFather bergan tokenni yozing.');
  console.log('Masalan: BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz');
  console.log('='.repeat(60) + '\n');
  process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);

// Xatoliklarni ushlab qolish (bot to'xtab qolmasligi uchun)
bot.catch((err, ctx) => {
  console.error(`Xatolik yuz berdi (${ctx.updateType}):`, err);
});

// Har bir kelgan xabarni konsolga yozib borish (monitoring)
bot.use(async (ctx, next) => {
  const user = ctx.from;
  const userInfo = user ? `${user.first_name} (@${user.username || 'username_yoq'}, ID: ${user.id})` : 'Noma‘lum';
  const text = ctx.message?.text || ctx.callbackQuery?.data || ctx.updateType;
  console.log(`[${new Date().toLocaleTimeString()}] [${userInfo}] -> ${text}`);
  return next();
});

// /start buyrug'i
bot.start(async (ctx) => {
  const firstName = ctx.from?.first_name || 'Foydalanuvchi';
  const welcomeText =
    `Assalomu alaykum, <b>${firstName}</b>! 👋\n\n` +
    `Ushbu bot orqali siz:\n` +
    `💵 <b>O‘zbekiston Markaziy Banki</b>ning rasmiy valyuta kurslarini ko‘rishingiz;\n` +
    `⛅ <b>O‘zbekiston viloyatlari</b> yoki o‘z joylashuvingiz bo‘yicha eng so‘nggi ob-havo ma‘lumotlarini bilishingiz mumkin.\n\n` +
    `Kerakli bo‘limni tanlash uchun pastdagi menyudan foydalaning! 👇`;

  await ctx.replyWithHTML(welcomeText, mainMenu);
});

// Asosiy menyuga qaytish
bot.hears('🔙 Asosiy menyu', async (ctx) => {
  await ctx.reply('Asosiy menyuga qaytdingiz. Kerakli bo‘limni tanlang:', mainMenu);
});

// Yordam va Bot haqida
const sendHelp = async (ctx) => {
  const helpText =
    `ℹ️ <b>Bot imkoniyatlari va qo‘llanma:</b>\n\n` +
    `• <b>💵 Valyuta kurslari:</b> Markaziy Bankning eng so‘nggi kurslarini ko‘rish.\n` +
    `• <b>⛅ Ob-havo:</b> Viloyatlar ro‘yxatidan tanlab, harorat va ob-havoni bilish.\n` +
    `• <b>📍 Mening joylashuvim:</b> GPS joylashuvingizni yuborib, aynan turgan joyingizdagi ob-havoni aniqlash.\n` +
    `• <b>💱 Valyuta hisoblash:</b> Botga to‘g‘ridan-to‘g‘ri masalan: <code>100 usd</code> yoki <code>50 eur</code> deb yozib yuborsangiz, uni so‘mda hisoblab beradi!\n\n` +
    `Buyruqlar:\n` +
    `/start - Botni qayta ishga tushirish\n` +
    `/help - Yordam menyusi`;

  await ctx.replyWithHTML(helpText, mainMenu);
};

bot.help(sendHelp);
bot.hears('ℹ️ Bot haqida', sendHelp);

// Valyuta kurslari bo'limi
bot.hears('💵 Valyuta kurslari', async (ctx) => {
  const waitMsg = await ctx.replyWithHTML('⏳ <i>Valyuta kurslari yuklanmoqda...</i>');
  const ratesText = await getPopularRatesMessage();

  try {
    await ctx.deleteMessage(waitMsg.message_id);
  } catch (e) {}

  await ctx.replyWithHTML(ratesText, currencyInlineMenu);
});

// Valyutani yangilash callback tugmasi
bot.action('refresh_currency', async (ctx) => {
  await ctx.answerCbQuery('Kurslar yangilanmoqda...');
  const ratesText = await getPopularRatesMessage();

  try {
    await ctx.editMessageText(ratesText, {
      parse_mode: 'HTML',
      ...currencyInlineMenu,
    });
  } catch (e) {}
});

// Ob-havo bo'limi
bot.hears('⛅ Ob-havo', async (ctx) => {
  const text =
    `⛅ <b>Ob-havo bo‘limi</b>\n\n` +
    `O‘zingizga kerakli viloyatni tanlang yoki pastdagi ` +
    `<b>«📍 Joylashuvim bo‘yicha ob-havo»</b> tugmasi orqali o‘z manzilingizdagi ob-havoni biling:`;

  await ctx.replyWithHTML(text, weatherMenu);
});

// GPS Joylashuv yuborilganda ob-havoni aniqlash
bot.on(message('location'), async (ctx) => {
  const { latitude, longitude } = ctx.message.location;

  const waitMsg = await ctx.replyWithHTML('⏳ <i>Joylashuvingiz bo‘yicha ob-havo aniqlanmoqda...</i>');
  const weatherText = await fetchWeather(latitude, longitude, 'Sizning joylashuvingiz');

  try {
    await ctx.deleteMessage(waitMsg.message_id);
  } catch (e) {}

  await ctx.replyWithHTML(weatherText);
});

// Matnli xabarlarni qayta ishlash (Viloyatlar, valyuta hisoblash yoki noma'lum matn)
bot.on(message('text'), async (ctx) => {
  const text = ctx.message.text.trim();

  // 1. Agar foydalanuvchi viloyat nomini tanlagan bo'lsa
  if (REGIONS[text]) {
    const region = REGIONS[text];
    const waitMsg = await ctx.replyWithHTML('⏳ <i>Ob-havo ma‘lumotlari olinmoqda...</i>');
    const weatherText = await fetchWeather(region.lat, region.lon, region.name);

    try {
      await ctx.deleteMessage(waitMsg.message_id);
    } catch (e) {}

    return ctx.replyWithHTML(weatherText);
  }

  // 2. Agar foydalanuvchi "100 usd" yoki "25.5 eur" deb yozgan bo'lsa
  const currencyMatch = text.match(/^(\d+(?:[.,]\d+)?)\s*([a-zA-Z]{3})$/);
  if (currencyMatch) {
    const amount = parseFloat(currencyMatch[1].replace(',', '.'));
    const code = currencyMatch[2];

    if (!isNaN(amount)) {
      const conversion = await convertCurrency(amount, code);
      if (conversion) {
        return ctx.replyWithHTML(conversion);
      }
    }
  }

  // 3. Agar boshqa tushunarsiz matn yozilgan bo'lsa (masalan "salom")
  await ctx.reply(
    "Tushunarsiz buyruq. Iltimos, pastdagi menyu tugmalaridan birini tanlang yoki /start bosing:",
    mainMenu
  );
});

// Botni ishga tushirish
console.log('\n' + '*'.repeat(50));
console.log('🤖 Bot ishga tushirilmoqda...');
console.log('Telegram‘ga kirib /start buyrug‘ini yuboring.');
console.log('Botni to‘xtatish uchun: Ctrl + C bosing.');
console.log('*'.repeat(50) + '\n');

bot.launch().catch((err) => {
  console.error('Botni ishga tushirishda xatolik:', err);
});

// Server (Render, Koyeb va boshqa bulutli xizmatlar) uchun mini HTTP port
import http from 'http';
const PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Valyuta va Ob-havo Telegram Boti 24/7 faol holatda!');
}).listen(PORT, () => {
  console.log(`🌐 Web server ${PORT}-portda tinglamoqda (Cloud xizmatlar uchun).`);
});

// To'xtatish signallari
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
