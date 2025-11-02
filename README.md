# 💰 Cüzdanım+ Mobile App

Modern ve kullanıcı dostu kişisel finans yönetimi mobil uygulaması. React Native ve Expo ile geliştirilmiş, gelir-gider takibi, bütçe yönetimi, finansal hedefler ve detaylı raporlama özellikleri sunar.

---

## 🎯 Amaç

Cüzdanım+, kullanıcıların finansal durumlarını kolayca takip etmelerini, harcamalarını kontrol altında tutmalarını ve finansal hedeflerine ulaşmalarını sağlayan bir mobil uygulamadır.

---

## ✨ Özellikler

- 🔐 Kullanıcı kayıt ve giriş sistemi (JWT)
- 💳 Çoklu hesap yönetimi (Banka, Kredi Kartı, Nakit)
- 💸 Gelir ve gider takibi
- 📊 Kategori bazlı bütçe yönetimi
- 🎯 Finansal hedef belirleme ve takip
- 🔄 Gerçek zamanlı bakiye ve ilerleme takibi
- ⚠️ Bütçe aşımı uyarıları

---

## 🛠 Teknolojiler

- **React Native** (0.74.5) & **Expo** (51.0.28)
- **TypeScript** (5.3.3)
- **React Query** (TanStack Query) - State management
- **React Navigation** - Sayfa yönlendirme
- **React Hook Form** + **Zod** - Form yönetimi ve validasyon
- **Victory Native** - Grafikler
- **Axios** - HTTP client
- **AsyncStorage** - Local storage

---

## 📦 Kurulum

### Gereksinimler

- Node.js (v18+)
- npm veya yarn
- Expo Go uygulaması (mobil cihaz için)

### Adımlar
```bash
# Projeyi klonla
git clone https://github.com/emre-x7/CuzdanimMobile.git
cd CuzdanimMobile

# Bağımlılıkları yükle
npm install

# Config dosyası oluştur
cp src/constans/config.ts
```

**`src/constans/config.ts` dosyasını düzenle:**
```typescript
export const config = {
  API_BASE_URL: 'http://YOUR_LOCAL_IP:5002/api', // Kendi local IP'nizi yazın
};
```

> **Not:** Local IP adresinizi öğrenmek için Windows'ta `ipconfig`, Mac/Linux'ta `ifconfig` komutunu kullanın.

---

## 🚀 Çalıştırma
```bash
# Development server'ı başlat
npx expo start

# iOS Simulator (sadece Mac)
npx expo start --ios

# Android Emulator
npx expo start --android
```

Fiziksel cihazda test için **Expo Go** uygulamasıyla QR kodu tarayın.

---

## 📁 Proje Yapısı
```
src/
├── api/                 # API servisleri
├── components/          # UI bileşenleri
├── constants/           # Sabitler (colors, enums)
├── context/            # Global state (AuthContext)
├── hooks/              # Custom React hooks
├── navigation/         # Navigasyon yapısı
├── screens/            # Ekranlar
├── types/              # TypeScript tanımları
├── utils/              # Yardımcı fonksiyonlar
└── config/             # Konfigürasyon
```

---

## 🔌 Backend API

Backend API şu endpointleri sağlamalıdır:

- **Auth:** `/api/auth/login`, `/api/auth/register`
- **Accounts:** `/api/accounts` (CRUD)
- **Transactions:** `/api/transactions` (CRUD)
- **Budgets:** `/api/budgets` (CRUD)
- **Goals:** `/api/goals` (CRUD + contribute)
- **Categories:** `/api/categories`
- **Dashboard:** `/api/dashboard`
- **Reports:** `/api/reports`

---

## 🎨 Ekranlar

1. **Dashboard** - Bakiye özeti, gelir/gider, son işlemler
2. **Hesaplar** - Hesap listesi ve yönetimi
3. **İşlemler** - Gelir/gider kayıtları
4. **Bütçeler** - Kategori bazlı bütçe takibi
5. **Hedefler** - Finansal hedef yönetimi
6. **Raporlar** - Grafiksel analizler

---

## 🔒 Güvenlik

- `src/config/config.ts` dosyası `.gitignore`'da (local IP içerir)
- JWT token tabanlı kimlik doğrulama
- Token otomatik yenileme
- Güvenli form validasyonu

---

## 📱 Uygulama Ekran Görüntüleri

**Cüzdanım+** mobil uygulamasının temel akışlarını gösteren görseller yer almaktadır.

### 1. Giriş ve Hesap Yönetimi Akışları

<p align="center">
  <img src="https://github.com/user-attachments/assets/42a26eea-4e8d-48dd-87c6-2d578c37f897" width="260" alt="Kayıt Olma Sayfası"> &nbsp; &nbsp;
  <img src="https://github.com/user-attachments/assets/e4161823-4b0d-460f-89df-c84b1071667c" width="260" alt="Giriş Yapma Sayfası"> &nbsp; &nbsp;
  <img src="https://github.com/user-attachments/assets/89d5f49a-d740-4d66-a48d-d554319741d3" width="260" alt="Hesaplarım Sayfası">
</p>
<p align="center">
  <img src="https://github.com/user-attachments/assets/d3ab06ea-9065-4d05-bbe8-2568dd12e135" width="260" alt="Yeni Hesap Ekleme Formu">
</p>

---

### 2. Harcama Takibi ve Ana Sayfa

<p align="center">
  <img src="https://github.com/user-attachments/assets/fe16ba64-9260-4507-ad09-3137e4856131" width="260" alt="Ana Kontrol Paneli (Dashboard)"> &nbsp; &nbsp;
  <img src="https://github.com/user-attachments/assets/cb4f8419-4235-4928-9acc-9de3aa35ff29" width="260" alt="İşlemler Geçmişi Sayfası"> &nbsp; &nbsp;
  <img src="https://github.com/user-attachments/assets/7356d49a-4e46-4a86-95cd-603bb1eb458d" width="260" alt="Yeni Gelir/Gider İşlemi Ekleme Formu">
</p>

---

### 3. Bütçeler ve Finansal Hedefler

<p align="center">
  <img src="https://github.com/user-attachments/assets/5cbb62b7-d47e-4a2a-b024-9635bfe8fe19" width="260" alt="Bütçelerim Sayfası"> &nbsp; &nbsp;
  <img src="https://github.com/user-attachments/assets/f8faece6-46ef-41ab-b14f-92480d3d468a" width="260" alt="Yeni Bütçe Oluşturma Formu"> &nbsp; &nbsp;
  <img src="https://github.com/user-attachments/assets/7fd7121a-c137-4303-904b-084cb29ebd54" width="260" alt="Hedeflerim Sayfası">
</p>
<p align="center">
  <img src="https://github.com/user-attachments/assets/a9a885a5-8edb-43bf-b851-7f1d7840d899" width="260" alt="Yeni Finansal Hedef Oluşturma Formu">
</p>


