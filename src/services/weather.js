import axios from 'axios';

// O'zbekiston viloyat va shaharlari koordinatalari
export const REGIONS = {
  'Toshkent': { lat: 41.2995, lon: 69.2401, name: 'Toshkent shahri' },
  'Samarqand': { lat: 39.6542, lon: 66.9597, name: 'Samarqand viloyati' },
  'Buxoro': { lat: 39.7747, lon: 64.4286, name: 'Buxoro viloyati' },
  'Andijon': { lat: 40.7821, lon: 72.3442, name: 'Andijon viloyati' },
  "Farg'ona": { lat: 40.3842, lon: 71.7843, name: "Farg'ona viloyati" },
  'Namangan': { lat: 40.9983, lon: 71.6726, name: 'Namangan viloyati' },
  'Qarshi': { lat: 38.8606, lon: 65.7891, name: 'Qashqadaryo (Qarshi)' },
  'Termiz': { lat: 37.2242, lon: 67.2783, name: 'Surxondaryo (Termiz)' },
  'Urganch': { lat: 41.5562, lon: 60.6317, name: 'Xorazm (Urganch)' },
  'Nukus': { lat: 42.4602, lon: 59.6166, name: 'Qoraqalpog‘iston (Nukus)' },
  'Jizzax': { lat: 40.1158, lon: 67.8422, name: 'Jizzax viloyati' },
  'Guliston': { lat: 40.4897, lon: 68.7842, name: 'Sirdaryo (Guliston)' },
  'Navoiy': { lat: 40.0844, lon: 65.3792, name: 'Navoiy viloyati' },
};

// WMO Weather interpretation codes
const WEATHER_DESCRIPTIONS = {
  0: ['Ochiq musaffo osmon', '☀️'],
  1: ['Asosan ochiq', '🌤'],
  2: ['Qisman bulutli', '⛅'],
  3: ['Bulutli', '☁️'],
  45: ['Tuman', '🌫'],
  48: ['Muzlagan tuman', '🌫❄️'],
  51: ['Yengil shivalama yomg‘ir', '🌦'],
  53: ['O‘rtacha shivalama yomg‘ir', '🌦'],
  55: ['Kuchli shivalama yomg‘ir', '🌧'],
  61: ['Yengil yomg‘ir', '🌧'],
  63: ['O‘rtacha yomg‘ir', '🌧'],
  65: ['Kuchli yomg‘ir', '🌧'],
  71: ['Yengil qor', '🌨'],
  73: ['O‘rtacha qor', '🌨'],
  75: ['Qalin qor', '❄️'],
  77: ['Qor donachalari', '🌨'],
  80: ['Qisqa muddatli yomg‘ir', '🌦'],
  81: ['Kuchli jala', '🌧⛈'],
  82: ['Juda kuchli yomg‘ir / jala', '⛈'],
  85: ['Yengil qor bo‘roni', '🌨'],
  86: ['Kuchli qor bo‘roni', '❄️'],
  95: ['Momaqaldiroq', '🌩'],
  96: ['Momaqaldiroq va do‘l', '⛈'],
  99: ['Kuchli momaqaldiroq va yirik do‘l', '⛈'],
};

function getWeatherDesc(code) {
  return WEATHER_DESCRIPTIONS[code] || ['Noma‘lum', '🌡'];
}

/**
 * Zaxira (fallback) ob-havo xizmati: wttr.in
 */
async function fetchWeatherFallback(lat, lon, locationName) {
  const url = `https://wttr.in/${lat},${lon}?format=j1`;
  const response = await axios.get(url, {
    headers: { 'User-Agent': 'curl/7.68.0' },
    timeout: 10000,
  });

  const cur = response.data.current_condition?.[0] || {};
  const weatherDay = response.data.weather?.[0] || {};

  const temp = cur.temp_C ?? '--';
  const feelsLike = cur.FeelsLikeC ?? '--';
  const humidity = cur.humidity ?? '--';
  const wind = cur.windspeedKmph ?? '--';
  const desc = cur.weatherDesc?.[0]?.value || 'Musaffo';

  const tempMax = weatherDay.maxtempC;
  const tempMin = weatherDay.mintempC;

  let forecastExtra = '';
  if (tempMax !== undefined && tempMin !== undefined) {
    forecastExtra = `📊 Bugun: min <b>${tempMin}°C</b> / max <b>${tempMax}°C</b>\n`;
  }

  return (
    `📍 <b>Hudud: ${locationName}</b>\n\n` +
    `☀️ <b>Holat:</b> ${desc}\n` +
    `🌡 <b>Harorat:</b> ${temp}°C\n` +
    `🤔 <b>His qilinishi:</b> ${feelsLike}°C\n` +
    `💧 <b>Namlik:</b> ${humidity}%\n` +
    `💨 <b>Shamol tezligi:</b> ${wind} km/soat\n` +
    `${forecastExtra}\n` +
    `🕒 <i>Ma'lumotlar real vaqtda yangilandi</i>`
  );
}

/**
 * Asosiy ob-havo ma'lumotlarini olish (Open-Meteo va zaxira wttr.in)
 */
export async function fetchWeather(lat, lon, locationName = 'Joylashuv') {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m` +
    `&daily=temperature_2m_max,temperature_2m_min&timezone=auto`;

  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
      },
      timeout: 8000,
    });
    const data = response.data;

    const current = data.current || {};
    const daily = data.daily || {};

    const temp = current.temperature_2m ?? '--';
    const feelsLike = current.apparent_temperature ?? '--';
    const humidity = current.relative_humidity_2m ?? '--';
    const wind = current.wind_speed_10m ?? '--';
    const code = current.weather_code ?? 0;

    const [descText, emoji] = getWeatherDesc(code);

    const tempMax = daily.temperature_2m_max?.[0];
    const tempMin = daily.temperature_2m_min?.[0];

    let forecastExtra = '';
    if (tempMax !== undefined && tempMin !== undefined) {
      forecastExtra = `📊 Bugun: min <b>${tempMin}°C</b> / max <b>${tempMax}°C</b>\n`;
    }

    return (
      `📍 <b>Hudud: ${locationName}</b>\n\n` +
      `${emoji} <b>Holat:</b> ${descText}\n` +
      `🌡 <b>Harorat:</b> ${temp}°C\n` +
      `🤔 <b>His qilinishi:</b> ${feelsLike}°C\n` +
      `💧 <b>Namlik:</b> ${humidity}%\n` +
      `💨 <b>Shamol tezligi:</b> ${wind} km/soat\n` +
      `${forecastExtra}\n` +
      `🕒 <i>Ma'lumotlar real vaqtda yangilandi</i>`
    );
  } catch (openMeteoError) {
    console.warn('Open-Meteo xatolik, zaxira xizmatga o‘tilmoqda...', openMeteoError.message);
    try {
      return await fetchWeatherFallback(lat, lon, locationName);
    } catch (fallbackError) {
      console.error('Ikkala ob-havo xizmati ham javob bermadi:', fallbackError.message);
      return `⚠️ Hozirda ob-havo xizmatlariga ulanishda muammo bo‘lmoqda. Iltimos, 1 daqiqadan so‘ng qayta urinib ko‘ring.`;
    }
  }
}
