# PANDUAN LENGKAP PEMASANGAN RYOKORENT DI ANDROID
**Aplikasi Administrasi Rental Sepeda Motor Malang & Batu (v3.5.0)**

Dokumen ini memuat panduan langkah-demi-langkah memasang aplikasi **RyokoRent** pada ponsel/tablet berbasis Android, baik melalui **PWA WebAPK langsung** (paling disarankan dan instan), maupun dengan **membuat berkas installer `.apk` mandiri**.

---

## DAFTAR METODE PEMASANGAN

| Metode | Tingkat Kesulitan | Kebutuhan | Hasil |
| :--- | :---: | :--- | :--- |
| **Metode 1: PWA WebAPK Instan** *(Sangat Direkomendasikan)* | **Sangat Mudah** (1 Menit) | Ponsel Android + Google Chrome | Terpasang langsung di App Drawer & Home Screen |
| **Metode 2: Unduh File `.apk` via PWABuilder** | **Mudah** (3 Menit) | Browser (PC/HP) tanpa instal software | Berkas installer `RyokoRent.apk` siap instal offline |
| **Metode 3: Kompilasi APK via Bubblewrap CLI** | **Lanjutan** (Developer) | Node.js, JDK 17+, Android SDK | Berkas `app-release-signed.apk` untuk distribusi / Play Store |

---

## METODE 1: INSTALASI INSTAN PWA / WebAPK (Paling Cepat & Praktis)

RyokoRent telah dikonfigurasi sebagai **Progressive Web App (PWA)** dengan Service Worker, Web Manifest, dan ikon adaptif maskable. Sistem Android melalui Google Chrome akan otomatis mengubahnya menjadi aplikasi native (**WebAPK**).

### Langkah-Langkah:
1. **Buka Browser Google Chrome** di ponsel Android Anda.
2. **Kunjungi URL Aplikasi**:
   ```text
   https://ais-pre-5fmxofm7zgewkvnw7msoyv-947129619991.asia-southeast1.run.app
   ```
   *(Atau domain produksi Anda sendiri jika telah di-binding).*
3. **Pemasangan Otomatis**:
   - Jika tombol/banner **"Pasang Aplikasi"** atau **"Install RyokoRent"** muncul di layar, ketuk tombol tersebut.
4. **Pemasangan Manual (Jika banner belum muncul)**:
   - Ketuk menu **Titik Tiga (⋮)** di pojok kanan atas browser Google Chrome.
   - Pilih menu **"Tambahkan ke Layar Utama"** (*Add to Home screen*) atau **"Instal Aplikasi"** (*Install app*).
   - Ketuk konfirmasi **"Instal"**.
5. **Selesai**:
   - Sistem Android akan memproses dalam beberapa detik.
   - Ikon **RyokoRent** akan muncul di layar beranda (*Home Screen*) dan di laci aplikasi (*App Drawer*).
   - Saat dibuka, aplikasi akan berjalan **layar penuh (Standalone Fullscreen)** tanpa bilah alamat (*address bar*) browser, persis seperti aplikasi native Android.

---

## METODE 2: MEMBUAT FILE `.APK` MENGGUNAKAN PWABUILDER (Tanpa Koding)

Jika Anda memerlukan file fisik berekstensi `.apk` untuk dikirimkan melalui WhatsApp, dibagikan ke tim lapangan, atau disimpan di flashdisk/Google Drive:

### Langkah-Langkah:
1. Buka situs resmi Microsoft PWABuilder di laptop atau ponsel:
   ```text
   https://www.pwabuilder.com/
   ```
2. Pada kolom input URL, masukkan tautan aplikasi RyokoRent:
   ```text
   https://ais-pre-5fmxofm7zgewkvnw7msoyv-947129619991.asia-southeast1.run.app
   ```
3. Klik tombol **"Start"**. PWABuilder akan memvalidasi Manifest dan Service Worker RyokoRent (status akan tercentang hijau).
4. Klik tombol **"Package for Stores"** -> Pilih platform **"Android"**.
5. Pada menu pengaturan Android:
   - **Package ID:** `com.ryokorent.app`
   - **App Name:** `RyokoRent Admin`
   - **Short Name:** `RyokoRent`
   - **Status bar color & theme:** `#090d16`
6. Klik **"Generate APK"** atau **"Download Package"**.
7. Anda akan memperoleh file installer berekstensi `.apk`.
8. **Cara Memasang File APK di HP Android:**
   - Salin file `.apk` ke ponsel Android Anda.
   - Buka file manager dan ketuk file `.apk` tersebut.
   - Jika muncul peringatan keamanan *"Izinkan penginstalan dari sumber tidak dikenal"*, pilih **Izinkan / Settings -> Aktifkan Sumber Tidak Dikenal**.
   - Ketuk **Instal**. Aplikasi siap digunakan.

---

## METODE 3: MEMBUAT APK TWA MENGGUNAKAN GOOGLE BUBBLEWRAP CLI (Khusus Developer)

Bagi pengembang yang ingin memproduksi berkas `app-release-signed.apk` dengan keystore sendiri:

### 1. Prasyarat Sistem:
- Node.js (v18+)
- Java Development Kit (JDK 17+)
- Android Command Line Tools / Android SDK

### 2. Perintah Eksekusi:
```bash
# 1. Instal Bubblewrap CLI secara global
npm install -g @bubblewrap/cli

# 2. Buat folder build terpisah
mkdir ryoko-twa-build && cd ryoko-twa-build

# 3. Inisialisasi konfigurasi dari manifest RyokoRent
bubblewrap init --manifest="https://ais-pre-5fmxofm7zgewkvnw7msoyv-947129619991.asia-southeast1.run.app/manifest.webmanifest"

# 4. Ikuti panduan pembuatan keystore keamanan
# 5. Bangun berkas APK bertandatangan (Signed APK)
bubblewrap build
```

Hasil build akan menghasilkan file:
- `app-release-signed.apk` (Siap pasang di ponsel mana saja / sideload).
- `app-release-bundle.aab` (Untuk diunggah ke Google Play Console).

---

## SPESIFIKASI PWA ANDROID RYOKORENT

Aplikasi ini telah dirancang khusus dengan standar mobile PWA optimal untuk operasional lapangan:

| Parameter | Konfigurasi | Keterangan |
| :--- | :--- | :--- |
| **App Name** | `RyokoRent Admin APK` | Nama lengkap aplikasi |
| **Short Name** | `RyokoRent` | Label di bawah ikon layar utama |
| **Theme Color** | `#090d16` (Deep Slate) | Menyesuaikan warna status bar & navbar Android |
| **Display Mode** | `standalone` | Bebas bilah browser, pengalaman 100% native |
| **Orientation** | `portrait-primary` | Terkunci tegak nyaman satu tangan di lapangan |
| **Ikon Maskable** | `pwa-maskable-512x512.png` | Mengikuti bentuk ikon HP (lingkaran, kotak, rounded) |
| **Penyimpanan Data** | `LocalStorage (Isolated)` | Data tersimpan aman di internal HP |
| **Offline Cache** | `Workbox Service Worker` | Dapat dibuka meski tanpa koneksi internet |

---

## PANDUAN PENGGUNAAN & PERAWATAN DI ANDROID

1. **Pencadangan Data Rutin (Backup)**:
   - Karena aplikasi menyimpan data armada, pelanggan, dan transaksi secara lokal di perangkat, buka tab **Pengaturan / Database** secara berkala (misal: setiap akhir pekan).
   - Ketuk **"Ekspor Backup JSON"** dan simpan berkas cadangan ke Google Drive atau kirimkan ke chat WhatsApp pribadi Anda.
2. **Kirim Pesan WhatsApp Cepat**:
   - Fitur kirim nota, konfirmasi booking, dan tagihan denda otomatis terintegrasi langsung memanggil aplikasi resmi WhatsApp di HP Android tanpa menyimpan nomor ke kontak terlebih dahulu.
3. **Pembersihan Cache HP**:
   - Jika Anda menggunakan fitur "Bersihkan Ruang Penyimpanan / Clean Master" di Android, pastikan data aplikasi RyokoRent tidak terhapus agar database LocalStorage sewa motor Anda tetap aman.
