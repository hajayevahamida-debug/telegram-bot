import { Markup } from 'telegraf';

// Asosiy menyu klaviaturasi
export const mainMenu = Markup.keyboard([
  ['💵 Valyuta kurslari', '⛅ Ob-havo'],
  [Markup.button.locationRequest('📍 Mening joylashuvim'), 'ℹ️ Bot haqida'],
])
  .resize()
  .placeholder("Quyidagi bo'limlardan birini tanlang...");

// Ob-havo uchun viloyatlar klaviaturasi
export const weatherMenu = Markup.keyboard([
  ['Toshkent', 'Samarqand'],
  ['Buxoro', 'Andijon'],
  ["Farg'ona", 'Namangan'],
  ['Qarshi', 'Termiz'],
  ['Urganch', 'Nukus'],
  ['Jizzax', 'Guliston'],
  ['Navoiy'],
  [Markup.button.locationRequest('📍 Joylashuvim bo‘yicha ob-havo')],
  ['🔙 Asosiy menyu'],
])
  .resize()
  .placeholder('Viloyatni tanlang...');

// Valyutani yangilash inline tugmasi
export const currencyInlineMenu = Markup.inlineKeyboard([
  [Markup.button.callback('🔄 Kurslarni yangilash', 'refresh_currency')],
]);

// Ob-havo uchun qulay inline viloyatlar tugmalari
export const weatherInlineMenu = Markup.inlineKeyboard([
  [Markup.button.callback('🏙 Toshkent', 'weather_Toshkent'), Markup.button.callback('🏛 Samarqand', 'weather_Samarqand')],
  [Markup.button.callback('🕌 Buxoro', 'weather_Buxoro'), Markup.button.callback('🌳 Andijon', 'weather_Andijon')],
  [Markup.button.callback('🌾 Farg‘ona', "weather_Farg'ona"), Markup.button.callback('🌸 Namangan', 'weather_Namangan')],
  [Markup.button.callback('☀️ Qarshi', 'weather_Qarshi'), Markup.button.callback('🏜 Termiz', 'weather_Termiz')],
  [Markup.button.callback('🏰 Urganch', 'weather_Urganch'), Markup.button.callback('⛵ Nukus', 'weather_Nukus')],
  [Markup.button.callback('⛰ Jizzax', 'weather_Jizzax'), Markup.button.callback('🌾 Guliston', 'weather_Guliston')],
  [Markup.button.callback('🏭 Navoiy', 'weather_Navoiy')],
]);

