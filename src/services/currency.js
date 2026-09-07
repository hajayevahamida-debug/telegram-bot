import axios from 'axios';

const CBU_URL = 'https://cbu.uz/uz/arkhiv-kursov-valyut/json/';

const CURRENCY_FLAGS = {
  USD: '🇺🇸',
  EUR: '🇪🇺',
  RUB: '🇷🇺',
  GBP: '🇬🇧',
  KZT: '🇰🇿',
  CNY: '🇨🇳',
  TRY: '🇹🇷',
  AED: '🇦🇪',
  JPY: '🇯🇵',
  KRW: '🇰🇷',
  CHF: '🇨🇭',
};

/**
 * Markaziy Bank API'sidan barcha valyuta kurslarini oladi
 */
export async function fetchCurrencyRates() {
  try {
    const response = await axios.get(CBU_URL, { timeout: 10000 });
    return response.data || [];
  } catch (error) {
    console.error('CBU API xatolik:', error.message);
    return [];
  }
}

/**
 * Kursning o'zgarishini ko'rsatish (o'sdi, tushdi yoki o'zgarmadi)
 */
function formatDiff(diffStr) {
  const val = parseFloat(diffStr);
  if (isNaN(val) || val === 0) return '➖ 0';
  if (val > 0) return `📈 +${diffStr}`;
  return `📉 ${diffStr}`;
}

/**
 * Asosiy ommabop valyutalar bo'yicha chiroyli formatlangan xabar qaytaradi
 */
export async function getPopularRatesMessage() {
  const rates = await fetchCurrencyRates();
  if (!rates || rates.length === 0) {
    return '⚠️ Valyuta kurslarini olishda xatolik yuz berdi. Keyinroq qayta urinib ko‘ring.';
  }

  const ratesMap = new Map();
  rates.forEach((item) => ratesMap.set(item.Ccy, item));

  const dateStr = rates[0]?.Date || '';
  const popularCodes = ['USD', 'EUR', 'RUB', 'GBP', 'CNY', 'KZT', 'TRY', 'AED'];

  let message = `🏦 <b>O‘zbekiston Respublikasi Markaziy Banki kursi</b>\n`;
  message += `📅 <i>Holat: ${dateStr}</i>\n\n`;

  for (const code of popularCodes) {
    if (ratesMap.has(code)) {
      const item = ratesMap.get(code);
      const flag = CURRENCY_FLAGS[code] || '🏳️';
      const rate = parseFloat(item.Rate).toLocaleString('uz-UZ', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      const diff = formatDiff(item.Diff);
      const name = item.CcyNm_UZ || code;

      message += `${flag} <b>1 ${code}</b> (${name}):\n`;
      message += `   └ <b>${rate} so‘m</b> (${diff})\n\n`;
    }
  }

  message += `💡 <i>Hisoblash uchun: masalan <code>100 usd</code> deb yozib yuborishingiz mumkin!</i>`;
  return message;
}

/**
 * Kiritilgan miqdorni (masalan 100 USD) so'mga hisoblab beradi
 */
export async function convertCurrency(amount, code) {
  const rates = await fetchCurrencyRates();
  const codeUpper = code.toUpperCase();
  const item = rates.find((r) => r.Ccy === codeUpper);

  if (!item) return null;

  const rate = parseFloat(item.Rate);
  const total = amount * rate;
  const flag = CURRENCY_FLAGS[codeUpper] || '🏳️';

  return (
    `💱 <b>Valyuta konvertori:</b>\n\n` +
    `${flag} <b>${amount.toLocaleString('uz-UZ')} ${codeUpper}</b> = <b>${total.toLocaleString('uz-UZ', { maximumFractionDigits: 2 })} UZS</b>\n` +
    `📊 Kurs: 1 ${codeUpper} = ${rate.toLocaleString('uz-UZ')} so‘m`
  );
}
