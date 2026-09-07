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
  Markup.button.callback('🔄 Yangilash', 'refresh_currency'),
]);
