import axios from 'axios';


export const REGIONS = {
  'Toshkent': { query: 'Tashkent', lat: 41.2995, lon: 69.2401, name: 'Toshkent shahri' },
  'Samarqand': { query: 'Samarkand', lat: 39.6542, lon: 66.9597, name: 'Samarqand viloyati' },
  'Buxoro': { query: 'Bukhara', lat: 39.7747, lon: 64.4286, name: 'Buxoro viloyati' },
  'Andijon': { query: 'Andijan', lat: 40.7821, lon: 72.3442, name: 'Andijon viloyati' },
  "Farg'ona": { query: 'Fergana', lat: 40.3842, lon: 71.7843, name: "Farg'ona viloyati" },
  'Namangan': { query: 'Namangan', lat: 40.9983, lon: 71.6726, name: 'Namangan viloyati' },
  'Qarshi': { query: 'Qarshi', lat: 38.8606, lon: 65.7891, name: 'Qashqadaryo (Qarshi)' },
  'Termiz': { query: 'Termez', lat: 37.2242, lon: 67.2783, name: 'Surxondaryo (Termiz)' },
  'Urganch': { query: 'Urgench', lat: 41.5562, lon: 60.6317, name: 'Xorazm (Urganch)' },
  'Nukus': { query: 'Nukus', lat: 42.4602, lon: 59.6166, name: 'Qoraqalpog‘iston (Nukus)' },
  'Jizzax': { query: 'Jizzakh', lat: 40.1158, lon: 67.8422, name: 'Jizzax viloyati' },
  'Guliston': { query: 'Gulistan', lat: 40.4897, lon: 68.7842, name: 'Sirdaryo (Guliston)' },
  'Navoiy': { query: 'Navoiy', lat: 40.0844, lon: 65.3792, name: 'Navoiy viloyati' },
};


const cache = new Map();
const CACHE_TTL = 10 * 60 * 1000;

function translateWeather(desc) {
  const d = (desc || '').toLowerCase();
  if (d.includes('sunny') || d.includes('clear')) return ['Ochiq musaffo osmon', '☀️'];
  if (d.includes('partly cloudy')) return ['Qisman bulutli', '⛅'];
  if (d.includes('cloudy') || d.includes('overcast')) return ['Bulutli', '☁️'];
  if (d.includes('fog') || d.includes('mist')) return ['Tuman', '🌫'];
  if (d.includes('thunder')) return ['Momaqaldiroq', '🌩'];
  if (d.includes('snow') || d.includes('blizzard') || d.includes('ice')) return ['Qor yog‘moqda', '🌨'];
  if (d.includes('rain') || d.includes('drizzle') || d.includes('shower')) return ['Yomg‘ir yog‘moqda', '🌧'];
  return [desc || 'Musaffo', '🌤'];
}

// 1-xizmat: wttr.in orqali olish
async function fetchFromWttr(query, locTitle) {
  const url = `https://wttr.in/${encodeURIComponent(query)}?format=j1`;
  const response = await axios.get(url, {
    headers: { 'User-Agent': 'curl/7.68.0' },
    timeout: 7000,
  });

  const data = response.data;
  const cur = data.current_condition?.[0] || {};
  const weatherDay = data.weather?.[0] || {};

  const temp = cur.temp_C ?? '--';
  const feelsLike = cur.FeelsLikeC ?? '--';
  const humidity = cur.humidity ?? '--';
  const wind = cur.windspeedKmph ?? '--';
  const rawDesc = cur.weatherDesc?.[0]?.value || 'Clear';

  const [descText, emoji] = translateWeather(rawDesc);
  const tempMax = weatherDay.maxtempC;
  const tempMin = weatherDay.mintempC;

  let forecastExtra = '';
  if (tempMax !== undefined && tempMin !== undefined) {
    forecastExtra = `📊 Bugun: min <b>${tempMin}°C</b> / max <b>${tempMax}°C</b>\n`;
  }

  return (
    `📍 <b>Hudud: ${locTitle}</b>\n\n` +
    `${emoji} <b>Holat:</b> ${descText}\n` +
    `🌡 <b>Harorat:</b> ${temp}°C\n` +
    `🤔 <b>His qilinishi:</b> ${feelsLike}°C\n` +
    `💧 <b>Namlik:</b> ${humidity}%\n` +
    `💨 <b>Shamol tezligi:</b> ${wind} km/soat\n` +
    `${forecastExtra}\n` +
    `🕒 <i>Ma'lumotlar real vaqtda yangilandi</i>`
  );
}

// 2-xizmat: Open-Meteo orqali olish
async function fetchFromOpenMeteo(lat, lon, locTitle) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min&timezone=auto`;
  const response = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
    timeout: 7000,
  });

  const cur = response.data.current || {};
  const daily = response.data.daily || {};
  const temp = cur.temperature_2m ?? '--';
  const feelsLike = cur.apparent_temperature ?? '--';
  const humidity = cur.relative_humidity_2m ?? '--';
  const wind = cur.wind_speed_10m ?? '--';
  const tempMax = daily.temperature_2m_max?.[0];
  const tempMin = daily.temperature_2m_min?.[0];

  let forecastExtra = '';
  if (tempMax !== undefined && tempMin !== undefined) {
    forecastExtra = `📊 Bugun: min <b>${tempMin}°C</b> / max <b>${tempMax}°C</b>\n`;
  }

  return (
    `📍 <b>Hudud: ${locTitle}</b>\n\n` +
    `☀️ <b>Holat:</b> Ochiq musaffo havo\n` +
    `🌡 <b>Harorat:</b> ${temp}°C\n` +
    `🤔 <b>His qilinishi:</b> ${feelsLike}°C\n` +
    `💧 <b>Namlik:</b> ${humidity}%\n` +
    `💨 <b>Shamol tezligi:</b> ${wind} km/soat\n` +
    `${forecastExtra}\n` +
    `🕒 <i>Ma'lumotlar real vaqtda yangilandi</i>`
  );
}

/**
 * Ob-havo ma'lumotlarini olish (Kesh va ikkita mustaqil API orqali)
 */
export async function fetchWeather(target, secondaryParam, locationName = 'Joylashuv') {
  let query = target;
  let locTitle = locationName;
  let lat = null;
  let lon = null;

  if (typeof target === 'number' && typeof secondaryParam === 'number') {
    lat = target;
    lon = secondaryParam;
    query = `${target},${secondaryParam}`;
    locTitle = locationName || 'Sizning joylashuvingiz';
  } else if (typeof target === 'string' && REGIONS[target]) {
    const reg = REGIONS[target];
    query = reg.query;
    lat = reg.lat;
    lon = reg.lon;
    locTitle = reg.name;
  }

  const cacheKey = `${query}`;
  // 1. Keshda mavjud bo'lsa, tezkor qaytaramiz (0 ms, 429 bo'lmaydi)
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.time < CACHE_TTL) {
    return cached.data;
  }

  // 2. Birinchi bo'lib wttr.in orqali urinib ko'ramiz
  try {
    const result = await fetchFromWttr(query, locTitle);
    cache.set(cacheKey, { time: Date.now(), data: result });
    return result;
  } catch (err1) {
    console.warn('wttr.in javob bermadi, Open-Meteo sinab ko‘rilmoqda...', err1.message);
  }

  // 3. Agar wttr.in ishlamasa, Open-Meteo orqali urinib ko'ramiz
  if (lat && lon) {
    try {
      const result = await fetchFromOpenMeteo(lat, lon, locTitle);
      cache.set(cacheKey, { time: Date.now(), data: result });
      return result;
    } catch (err2) {
      console.error('Open-Meteo ham javob bermadi:', err2.message);
    }
  }

  // 4. Agar avvalgi kesh bor bo'lsa, eskisini qaytaramiz
  if (cached) {
    return cached.data;
  }

  return `⚠️ Hozirda ob-havo xizmatlariga ulanishda muammo bo‘lmoqda. Iltimos, 1 daqiqadan so‘ng qayta urinib ko‘ring.`;
}
