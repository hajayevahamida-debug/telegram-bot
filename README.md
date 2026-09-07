# Valyuta va Ob-havo Telegram Boti (Node.js)

Ushbu bot **Node.js** muhitida zamonaviy **Telegraf** freymvorki orqali yaratilgan.
Ma'lumotlar manbai:
- 🏦 **O‘zbekiston Respublikasi Markaziy Banki (CBU)** rasmiy ochiq API'si.
- ⛅ **Open-Meteo** ochiq ob-havo xizmati (bepul, API kalit talab qilinmaydi).

---

## 🚀 Imkoniyatlari

1. **💵 Valyuta kurslari:**
   - AQSH Dollari (USD), Yevro (EUR), Rossiya Rubli (RUB), Angliya Funt (GBP), Qozog‘iston Tengesi (KZT), Xitoy Yuani (CNY), Turk Lirasi (TRY), BAA Dirhami (AED).
   - Har bir valyutaning rasmiy kursi va dinamikasi (📈 oshgan, 📉 tushgan, ➖ o‘zgarmagan).
   - 🔄 «Yangilash» inline tugmasi.
   - 💱 **Avtomatik kalkulyator:** Masalan botga `100 usd` yoki `500 eur` deb yozib yuborsangiz, avtomatik so‘mga aylantirib beradi.

2. **⛅ Ob-havo ma'lumotlari:**
   - O‘zbekistonning barcha viloyat va shaharlari (Toshkent, Samarqand, Buxoro, Andijon, Farg‘ona, Namangan, Qarshi, Termiz, Urganch, Nukus, Jizzax, Guliston, Navoiy).
   - Joriy harorat, his qilinishi, holati (ochiq, bulutli, yomg‘ir...), namlik, shamol tezligi va kunlik min/max harorat.
   - 📍 **GPS Joylashuv:** «Joylashuvim bo‘yicha ob-havo» tugmasini bosib o‘z geolokatsiyangizni yuborsangiz, aynan turgan joyingizdagi ob-havoni ko‘rsatadi.

---

## 🛠 Ishga tushirish bo'yicha ko'rsatma

### 1. Bot tokenini kiritish
Loyihaning asosiy papkasidagi `.env` faylini oching va `@BotFather` dan olgan tokenni qo‘ying:
```env
BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
```

### 2. Botni ishga tushirish
Terminalda (PowerShell yoki CMD) loyiha papkasida quyidagi buyruqni bering:
```bash
npm start
```
yoki ishlab chiqish (auto-reload) rejimida:
```bash
npm run dev
```

Agar bot muvaffaqiyatli ishga tushsa:
```
**************************************************
🤖 Bot ishga tushirilmoqda...
Telegram‘ga kirib /start buyrug‘ini yuboring.
Botni to‘xtatish uchun: Ctrl + C bosing.
**************************************************
```
xabari chiqadi.
