# Klinik Digital — Domain: Klinik Digital

![React Native](https://img.shields.io/badge/React_Native-20232A?style=flat&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-000020?style=flat&logo=expo&logoColor=white)
![AsyncStorage](https://img.shields.io/badge/AsyncStorage-Local_Persistence-00b894)

> Klinik Digital adalah aplikasi manajemen klinik sederhana yang memudahkan pasien mencari dokter, membuat booking konsultasi, dan melihat riwayat konsultasi mereka — semua tersimpan secara lokal di perangkat.

---

## 📸 Screenshots

| Login Screen | Home Screen | Feature Screen |
|:---:|:---:|:---:|
| ![Login](assets/screenshots/login.png) | ![Home](assets/screenshots/home.png) | ![Feature](assets/screenshots/feature.png) |

> Ganti gambar di atas dengan screenshot asli dari HP kamu (simpan di `assets/screenshots/`).

---

## ✨ Fitur Utama

- [x] Login/Register dengan validasi form (email, password, konfirmasi password)
- [x] Daftar dokter dengan FlatList + dummy data
- [x] Detail dokter dengan navigasi Stack (kirim parameter `doctorId`)
- [x] Booking konsultasi dengan validasi tanggal & keluhan
- [x] Riwayat & status booking aktif (tab Booking)
- [x] Foto KTP via kamera (expo-image-picker), termasuk handle izin ditolak
- [x] Data persisten dengan AsyncStorage (session, users, history, foto profil)
- [x] Bottom Tab Navigation (Beranda, Booking, Profil) + Stack Navigator bersarang

---

## 🛠️ Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Framework | React Native + Expo (SDK 51) |
| Navigation | React Navigation v6 (Native Stack + Bottom Tabs) |
| Storage | @react-native-async-storage/async-storage |
| Device | expo-image-picker (kamera untuk foto KTP) |
| Build | EAS Build (Expo Application Services) |

---

## 📁 Struktur Folder

```
klinik-digital-uas/
├── App.js
├── app.json
├── eas.json
├── package.json
├── index.js
├── babel.config.js
├── src/
│   ├── navigation/AppNavigator.js
│   ├── screens/ (LoginScreen, HomeScreen, DetailScreen, ProfileScreen)
│   ├── components/ (ItemCard, LoadingSpinner, EmptyState)
│   ├── services/ (api.js, storage.js)
│   └── constants/colors.js
└── assets/
    ├── icon.png
    ├── splash.png
    └── screenshots/
```

---

## 🚀 Cara Menjalankan

```bash
git clone https://github.com/USERNAME/klinik-digital-uas.git
cd klinik-digital-uas
npm install
npx expo start
```

Scan QR Code dengan Expo Go di HP (pastikan HP & laptop di WiFi yang sama).

---

## 📦 Download APK

[Download APK terbaru](LINK_APK_GITHUB_RELEASE_ATAU_DRIVE)

---

## 🌐 Expo Snack

[Buka di Expo Snack](LINK_EXPO_SNACK)

---

## 👤 Developer

**Nama Lengkap** | NIM | Kelas
Universitas Prima Indonesia — Prodi Sistem Informasi
Mata Kuliah: Pemrograman Mobile (TI-MOBILE-01)
# klinik-digital-uas
