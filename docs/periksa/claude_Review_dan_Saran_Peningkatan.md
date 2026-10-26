# RyokoRent Android PWA: Review Kode & Saran Peningkatan Sistem

Tanggal review: 26 Oktober 2026
Basis: `APPRENT-main.zip` (React 19, TypeScript, Vite PWA, penyimpanan LocalStorage)

**Cakupan.** Dibaca penuh: `bookingEngine.ts`, `ryoko.ts`, `storageService.ts`, `whatsappChatParser.ts`, `telegramBotService.ts`, `googleSheetsService.ts`, handler bisnis `App.tsx` (baris 100–740), submit `NewBookingModal.tsx`. Diperiksa sebagian (grep): `whatsappService.ts`, `vite.config.ts`, `index.html`, komponen UI.
**Batasan.** `npm install`, `tsc`, dan build tidak berhasil dijalankan di sandbox review. Semua temuan berasal dari pembacaan kode, belum dari eksekusi. Verifikasi dengan unit test sebelum menganggap sebuah bug terbukti.

---

## Daftar Isi

1. Ringkasan Eksekutif
2. Kekuatan yang Dipertahankan
3. Temuan per Area
4. Matriks Kepatuhan Aturan Bisnis & 13 Field
5. Saran Peningkatan Sistem dan Cara Menerapkannya
6. Roadmap Terprioritas
7. Rencana Pengujian
8. Pertanyaan Kebijakan untuk Pemilik Bisnis

---

## 1. Ringkasan Eksekutif

| Aspek | Skor | Catatan |
|---|---|---|
| Arsitektur | 78 | Mesin bisnis murni, tipe kuat, WIB eksplisit |
| Logika bisnis | 65 | Celah double-booking, guard tidak konsisten |
| Keandalan data | 55 | LocalStorage tanpa pengaman pemulihan |
| PWA & integrasi | 60 | Ikon PWA tidak ada, tombol Telegram tidak berfungsi |
| **Total** | **68 / 100** | Layak untuk satu operator, belum aman untuk operasional penuh |

Tiga risiko terbesar:
1. **Data bisa hilang atau tertimpa seed** (JSON korup, kuota penuh, data situs dihapus Android).
2. **Double-booking dan tracking salah** karena jalur pembuatan booking melewati guard.
3. **Link WhatsApp bisa terkirim ke nomor palsu** (`6281234567890`) bila nomor kosong.

---

## 2. Kekuatan yang Dipertahankan

- `bookingEngine.ts` berisi fungsi murni, mudah diuji.
- Epoch WIB eksplisit (`parseWibToEpoch`, `epochToWibInput`) sehingga tidak bergeser di perangkat berzona lain.
- `NEXT_STATUS_TRANSITIONS` + `checkTransition` dipakai di semua handler status.
- Parser punya `splitLabel` (titik dua pertama), `validYmd`, daftar `warnings`, tanpa fallback palsu.
- Keamanan dasar: escape HTML Telegram, redaksi NIK, ekspor JSON tanpa token secara default, penanganan `QuotaExceededError`, sinkron antar-tab, `safe-area-inset-bottom` di bottom-nav.

---

## 3. Temuan per Area

Tingkat: **P0** kritis, **P1** penting, **P2** penyempurnaan.

### 3.1 Penyimpanan data

| # | Tingkat | Temuan | Lokasi |
|---|---|---|---|
| S1 | P0 | JSON korup → `loadDatabase` mengembalikan seed; simpan berikutnya menimpa data asli. | `storageService.ts` catch |
| S2 | P0 | Seed `INITIAL_DATABASE` dipakai bersama (referensi sama) dan dimutasi `saveDatabase`. | `storageService.ts` |
| S3 | P0 | Simpan gagal (kuota) hanya `alert`, tetapi `setDb` tetap jalan: UI tampak tersimpan, hilang saat reload. | `App.tsx` `updateDatabaseState` |
| S4 | P1 | Impor tidak memigrasi `tracking`, `users`, `serviceRecords`; tanpa backup otomatis sebelum menimpa; backup tanpa rahasia menghapus token. | `importDatabaseJSON` |
| S5 | P0 | Tidak ada `navigator.storage.persist()`; "hapus data situs" di Android menghapus seluruh bisnis. | PWA |
| S6 | P1 | Handler membaca `db` dari closure; tab basi menimpa tab lain (last-write-wins). | `App.tsx` |
| S7 | P0 | `id: Date.now()` untuk booking; tombol submit tidak dikunci; `nextId` tersedia tetapi tidak dipakai. | `NewBookingModal.tsx:238` |
| S8 | P2 | Satu blob JSON ditulis ulang setiap aksi; log harian dan servis tumbuh tanpa batas. | `saveDatabase` |

### 3.2 Mesin booking & state machine

| # | Tingkat | Temuan |
|---|---|---|
| B1 | P0 | `handleCreateBooking` dengan `lockUnitId` langsung `approved` + tracking `disewa` tanpa `checkTransition`/`isUnitAvailableForRange`. |
| B2 | P0 | Tracking `disewa` diset saat approve (belum serah terima); `tracking.bookingId` hanya muat satu booking per unit. |
| B3 | P0 | `handleCancelBooking` mereset tracking tanpa memeriksa `t.bookingId === bookingId`. |
| B4 | P1 | Tracking `servis`/`kurir` memblokir unit untuk semua rentang waktu, termasuk booking lusa. |
| B5 | P1 | Booking `approved` yang tidak diambil mengunci unit selamanya (hanya `disewa` diperpanjang ke "sekarang"). |
| B6 | P1 | `checkTransition` ke `disewa` tidak memeriksa `statusServis`, tracking `servis`/`kurir`. |
| B7 | P1 | `handleConfirmExchange` tanpa cek bentrok booking `approved` unit baru, `statusServis`, dan status booking. |
| B8 | P1 | D-20 di handler hanya melindungi `disewa`; `diservis` dan `selesai` bisa terhapus permanen. Tidak ada status `dibatalkan`. |
| B9 | P2 | `handleSendToService` tidak mengubah `unit.statusServis`; sinkron baru terjadi lewat update tracking manual. |

### 3.3 Denda & tarif

| # | Tingkat | Temuan |
|---|---|---|
| D1 | P0 | Toleransi tidak konsisten: ShortRent `< 60`, harian `<= 60`. |
| D2 | P1 | Denda harian menagih seluruh menit setelah lewat toleransi (61 menit = 2 jam). Perlu kepastian kebijakan. |
| D3 | P1 | `harga3Jam/6Jam/9Jam/12Jam` tanpa fallback → `NaN` jika kosong. |
| D4 | P2 | Cabang `booking.selesaiAt` selalu NaN (string locale `id-ID`), kode mati. |
| D5 | P1 | Bulan dibulatkan `Math.round(hari/30)`; bulan parsial tidak diprorata; 28+ hari bisa lebih murah daripada kombinasi minggu+hari. |

### 3.4 Parser WhatsApp

| # | Tingkat | Temuan |
|---|---|---|
| P1 | P0 | Ekspor chat `[12/10/25 14:03] Budi: 1. Nama: …` dipecah di titik dua jam, baris hilang. |
| P2 | P0 | Aturan jadwal selesai (`includes('pengembalian')`) berjalan sebelum aturan lokasi; `Lokasi pengembalian` menimpa tanggal selesai. Aturan `jam pengembalian` jadi kode mati. |
| P3 | P1 | Nilai pada baris berikutnya (`Nama:⏎Budi`) dan alamat multi-baris hilang tanpa peringatan. |
| P4 | P1 | Hanya pemisah `:`; `-`/`=` tidak dikenali. |
| P5 | P1 | Tanggal bertitik `12.10.2026` tidak didukung dan terbaca jam 12:10. |
| P6 | P1 | Tanggal tanpa tahun tidak maju ke tahun depan bila sudah lewat. |
| P7 | P1 | ID pendukung tidak terdeteksi → `SIM_C` diam-diam; `idPendukungDetected` tidak dipakai. Menyalin semua opsi template → KTM. |
| P8 | P2 | `jumlahHelmExplicit` tidak dipakai; default helm: parser 2, Telegram 1, nota 2. |
| P9 | P2 | `label.startsWith('3.')` dan `includes('antar')` terlalu longgar. |

### 3.5 Integrasi

| # | Tingkat | Temuan |
|---|---|---|
| I1 | P0 | `normalizeWhatsAppNumber('')` → `6281234567890` (nomor palsu). Tiga normalizer berbeda. |
| I2 | P0 | Webhook Sheets mengirim teks pelanggan mentah; nama seperti `=IMPORTXML(...)` bisa jadi formula di Apps Script. Webhook tanpa shared secret. |
| I3 | P1 | Tombol Telegram `callback_data` tidak berfungsi (tanpa webhook/`getUpdates`); `executeTelegramActionCallback` tidak dipanggil. |
| I4 | P1 | Bila callback dihubungkan: memutasi objek langsung, melompati `checkTransition`, tidak update tracking, denda tetap Rp25.000. |
| I5 | P1 | Alert Telegram hanya jalan saat aplikasi terbuka; bukan real-time. Token bot disimpan di localStorage. |
| I6 | P1 | Antrean offline Sheets tidak pernah dikosongkan (tidak ada flush), dipotong 50 baris; mode tanpa URL melaporkan sukses. |
| I7 | P2 | Skema Sheets: `waktuPemesanan` string locale; `diservis` → `NEED_DOCS`; `disewa` → "Tugaskan Kurir Antar"; kolom pool, `returnPool`, `actualReturnEpoch`, riwayat tukar unit tidak ada; header "IG/FB" tanpa TikTok; urutan kolom ditulis dua kali. |
| I8 | P2 | `csvCell` memprefiks `'` pada nilai berawalan `+` (nomor), tidak menangani `\t`/`\r`. |

### 3.6 PWA, keamanan, UX

| # | Tingkat | Temuan |
|---|---|---|
| U1 | P0 | `public/` kosong; manifest merujuk ikon 192/512/maskable, `apple-touch-icon.png`, `icon.svg`, `favicon.ico`. Chrome tidak menawarkan instal. |
| U2 | P1 | `registerType: 'autoUpdate'` bisa memuat ulang halaman saat modal terbuka. |
| U3 | P1 | Tidak ada autentikasi; peran hanya mengatur tampilan; handler tidak memeriksa izin. |
| U4 | P2 | `nowStr` (zona perangkat) berlabel "WIB", ditulis duplikat sekitar 8 kali; log audit memakai `operatorName` dan ID `Date.now()`. |
| U5 | P2 | 150× `text-[10px]`, 18× `text-[9px]`; `body` memakai `min-h-screen` (App sudah `100dvh`). |
| U6 | P2 | Dependensi tak terpakai (`express`, `dotenv`, `@google/genai`); nama paket `zlce-studio`. |

---

## 4. Matriks Kepatuhan

### Aturan bisnis

| Aturan | Status | Catatan |
|---|---|---|
| BR-01 Tarif multi-tier | Sebagian | D3, D5 |
| BR-02 Matriks 5 status | Sebagian | B1, I4 melewati guard |
| BR-03 Satu unit fisik per booking | Sebagian | B2, B3 |
| BR-04 Buffer 60 menit & toleransi 60 menit | Sebagian | Buffer benar; toleransi D1 |
| BR-05 Denda keterlambatan | Sebagian | D1, D2 |
| BR-06 Pelacakan posisi armada | Sebagian | B4 |
| BR-07 Alert pengembalian | Belum | I3, I5 |
| BR-08 Tujuh kategori servis | Sesuai | Tipe `ServiceCategory` lengkap; UI belum diaudit |
| D-20 Proteksi hapus | Sebagian | B8 |

### 13 field form booking

| # | Field | Parser | Form | Nota | WA | Catatan |
|---|---|---|---|---|---|---|
| 1 | Nama | OK | Wajib | OK | OK | |
| 2 | Alamat KTP | OK | Opsional | OK | OK | |
| 3 | ID pendukung | Lemah | OK | OK | Enum mentah | P7 |
| 4 | Alamat saat ini | OK | Opsional | OK | OK | |
| 5 | ID sosmed | OK | Opsional | OK | OK | Header Sheets tanpa TikTok |
| 6 | No telp | OK | Wajib | OK | OK | I1 |
| 7 | Telp darurat | OK | Opsional | OK | OK | |
| 8 | Jadwal mulai | Lemah | OK | OK | OK | P1, P5, P6 |
| 9 | Jadwal selesai | Lemah | OK | OK | OK | P2 |
| 10 | Lokasi antar | Lemah | OK | OK | OK | P9 |
| 11 | Lokasi jemput | Lemah | OK | OK | OK | P2 |
| 12 | Model unit | OK | OK | OK | OK | |
| 13 | Jumlah helm | OK | OK | OK | OK | P8 |

Catatan: prompt review awal hanya mendaftar 12 butir; kode menetapkan "Jumlah helm" sebagai field ke-13. Di modal hanya nama dan nomor WA yang wajib.

---

## 5. Saran Peningkatan Sistem dan Cara Menerapkannya

### 5.1 Keandalan data (mengatasi S1–S8)

**Tujuan:** tidak ada skenario yang membuat data bisnis hilang diam-diam.

**Cara:**
1. **Load aman.** Pada kegagalan parse, simpan salinan mentah ke kunci `ryokourent_db_v1_corrupt_<timestamp>` sebelum memakai seed. Gunakan `structuredClone(INITIAL_DATABASE)`.
2. **Satu fungsi `migrate(db)`** dipakai oleh `loadDatabase` dan `importDatabaseJSON`. Isi: default untuk `tracking`, `users`, `serviceRecords`, `dailyOperationalLogs`, `settings`, ditambah penaikan `version`.
3. **Simpan atomik di UI.** `updateDatabaseState` hanya `setDb` bila `saveDatabase` sukses. Bila gagal, tampilkan banner permanen "Belum tersimpan" dan tombol ekspor.
4. **Persistensi.** Panggil `navigator.storage.persist()` saat startup dan tampilkan statusnya di Pengaturan.
5. **Backup otomatis.** Simpan snapshot harian (maksimal 7) ke kunci terpisah, ditambah pengingat ekspor JSON mingguan ke Google Drive/WhatsApp. Impor wajib membuat snapshot "sebelum impor".
6. **Reducer tunggal.** Ganti handler yang membaca `db` dari closure dengan `useReducer` atau updater fungsional (`setDb(prev => …)`), lalu muat ulang dari storage bila event `storage` datang.
7. **ID.** Pakai `nextId(db.bookings)` dan `disabled` pada tombol submit saat `isSubmitting`.
8. **Jangka menengah.** Pindah ke IndexedDB (library `idb`), satu store per koleksi. Alasannya: tidak ada batas ~5 MB, tulis per-record, dan tidak memblokir thread utama.

### 5.2 Integritas booking & unit (mengatasi B1–B9)

**Tujuan:** satu pintu validasi untuk semua perubahan status unit.

**Cara:**
1. Buat `bookingService.ts` dengan fungsi murni `applyTransition(db, bookingId, to, payload): { db } | { error }`. Semua jalur (UI, Telegram, impor) memanggilnya. `checkTransition` jadi bagian internal.
2. `handleCreateBooking` dengan kunci unit memanggil `applyTransition(..., 'ryokou_approved')` setelah booking dibuat dalam state sementara, sehingga bentrok ditolak.
3. **Tracking diturunkan dari booking, bukan disimpan ganda.** Fungsi `deriveTracking(unit, bookings, now)`: `disewa` bila ada booking `ryokou_disewa` untuk unit itu; `servis` bila `diservis` atau `statusServis==='servis'`; selain itu `parkir`/`kurir` menurut catatan manual. Ini menghapus B2, B3, B9 sekaligus.
4. **Blokir berbasis rentang.** Untuk `servis`/`kurir`, gunakan `estimasiSelesai` (default 24 jam) sebagai batas blokir, bukan blokir total (B4).
5. **No-show.** Booking `approved` yang lewat `startEpoch + toleransi` (default 3 jam) ditandai "terlambat diambil" di dashboard dan tidak lagi mengunci unit setelah dibatalkan operator (B5).
6. Tambahkan status `ryokou_dibatalkan` (soft-cancel, hanya dari `booking`/`approved`). Hapus permanen hanya untuk `ryokou_booking` tanpa unit. Lindungi `diservis` dan `selesai` di level handler (B8).
7. `checkTransition` ke `disewa` memeriksa `statusServis` dan tracking `servis`; `exchange` memanggil `isUnitAvailableForRange` untuk rentang sisa sewa (B6, B7).

### 5.3 Denda dan tarif (mengatasi D1–D5)

**Cara:**
1. Satu konstanta `TOLERANCE_MIN` dalam `settings` dan dipakai kedua jalur (D1).
2. Putuskan kebijakan D2 (lihat bagian 8), lalu tulis sebagai tabel uji: input (durasi, telat, tarif) → denda yang diharapkan.
3. Validasi tarif lengkap saat menyimpan model motor; `calculateOvertimePenalty` mengembalikan error bila tarif kosong, bukan `NaN` (D3).
4. Simpan `actualReturnEpoch` saat serah terima kembali; hapus cabang `selesaiAt` (D4).
5. Denda berjalan (belum selesai) ditampilkan sebagai "estimasi", dan nominal final dibekukan saat `selesai` (sudah dilakukan di `handleConfirmFinish`).
6. Untuk sewa ≥28 hari: hitung `bulan penuh + sisa hari` dan ambil yang termurah bagi pelanggan, atau tetapkan aturan eksplisit (D5).

### 5.4 Parser WhatsApp (mengatasi P1–P9)

**Tujuan:** menerima chat acak apa adanya, dan jujur tentang yang tidak terbaca.

**Cara:**
1. **Pra-pemrosesan.** `stripChatPrefix` untuk timestamp ekspor chat (`[dd/mm/yy hh:mm] Nama:` dan `dd/mm/yyyy hh.mm - Nama:`).
2. **Satu tabel aturan berurutan**, mulai dari yang paling spesifik: `lokasi penjemputan/pengembalian`, `jam pengembalian`, lalu `jadwal selesai`. Setiap aturan: `{ field, patterns, priority }`.
3. **Pemisah fleksibel.** Regex `^(.{2,40}?)\s*[:=\-–]\s*(.*)$` hanya bila bagian kiri cocok dengan alias field dikenal.
4. **Nilai multi-baris.** Bila baris berikutnya tidak memiliki label dikenal, tempelkan ke field sebelumnya. Bila label tanpa nilai, ambil baris berikutnya.
5. **Tanggal.** Dukung `dd.mm.yyyy`, nama hari dan "besok/lusa" (relatif ke `now`), dan roll tahun bila tanggal tanpa tahun sudah lewat.
6. **Warning menyeluruh.** Pakai `idPendukungDetected` dan `jumlahHelmExplicit`; tambahkan warning "alamat KTP kosong", "telp darurat kosong". Tampilkan tiap field bermasalah dengan tanda kuning di modal sebelum disimpan.
7. **Uji dengan korpus nyata.** Kumpulkan 30–50 chat pelanggan asli (nama disamarkan) sebagai fixture, dan targetkan ≥90% field terbaca benar.
8. Pertimbangkan tombol "bagikan ke aplikasi" (Web Share Target) agar chat WhatsApp bisa dikirim langsung ke PWA.

### 5.5 WhatsApp, Telegram, Google Sheets (mengatasi I1–I8)

**WhatsApp**
1. Satu `normalizePhone()` yang mengembalikan `null` bila tidak valid; hapus nomor fallback. Semua pemanggil menampilkan "Nomor WA tidak valid" dan tidak membuka link.
2. Tambahkan uji untuk `+62 08…`, `0812-…`, `8123…`, dan nomor kosong.

**Google Sheets**
1. **Sanitasi di dua lapis.** Di klien, awali teks bebas yang berawalan `= + - @ \t \r` dengan `'`. Di Apps Script, tulis dengan `setValue` pada sel berformat teks dan jangan pernah `setFormula`.
2. **Shared secret.** Kirim `secret` di body; Apps Script menolak bila tidak cocok (simpan di Script Properties).
3. **Flush antrean.** Fungsi `flushOfflineQueue()` dipanggil saat event `online` dan saat aplikasi dibuka; hapus item hanya setelah respons sukses. Mode tanpa URL harus menampilkan "Belum terhubung", bukan sukses.
4. **Skema.** Definisikan sekali `const COLUMNS = [{ key, header, get }]` dan hasilkan header, CSV, serta payload dari array itu. Tambahkan kolom: pool, tanggal selesai aktual, pool kembali, kategori tarif, keterangan denda, flag luar jam, riwayat tukar unit. Simpan timestamp ISO.
5. Perbaiki pemetaan: `diservis` → status "SERVIS"; opsi tindak lanjut menurut status sebenarnya.

**Telegram**
1. Pilih salah satu:
   - **Ringan:** hapus tombol `callback_data`, pertahankan tombol URL (WA dan Maps), dan ganti teks "aksi 1-klik" agar tidak menjanjikan hal yang tidak ada.
   - **Penuh:** Cloudflare Worker/Apps Script sebagai webhook bot. Worker menyimpan token (tidak di perangkat), menjalankan cron tiap 15 menit untuk alert jatuh tempo, dan memanggil API/state yang sama.
2. Untuk mode penuh, data booking perlu server kecil (mis. Apps Script + Sheet sebagai sumber kebenaran, atau Supabase/Firebase). Ini juga membuka sinkron multi-perangkat.
3. Jangan simpan token bot di localStorage bila memungkinkan. Bila terpaksa, tandai sebagai risiko di Pengaturan.
4. Callback apa pun wajib melewati `applyTransition` (bagian 5.2), tanpa mutasi langsung.

### 5.6 PWA dan Android (mengatasi U1–U6)

**Cara:**
1. **Ikon.** Buat `public/pwa-192x192.png`, `pwa-512x512.png`, `pwa-maskable-512x512.png`, `apple-touch-icon.png`, `icon.svg`, `favicon.ico`. `sharp` sudah ada di devDependencies: tambahkan `scripts/gen-icons.mjs` dari satu SVG sumber. Uji maskable di maskable.app.
2. **Update.** Ubah ke `registerType: 'prompt'` dan tampilkan toast "Versi baru tersedia, Muat ulang" yang hanya aktif bila tidak ada modal terbuka.
3. **Manifest.** Tambah `lang: 'id'`, `categories: ['business','productivity']`, `shortcuts` (Booking Baru, Armada, Jatuh Tempo) dan `screenshots`. Pertimbangkan `orientation: 'portrait'`.
4. **Autentikasi ringan.** PIN 4–6 digit per pengguna (hash `SHA-256` + salt, disimpan di data), kunci otomatis setelah N menit. Cek izin di dalam `applyTransition`, bukan hanya di UI. Ini bukan keamanan server; untuk data multi-pengguna sungguhan perlu backend.
5. **UI.** Naikkan teks minimum ke 11–12 px, target sentuh ≥44 px, ganti `min-h-screen` dengan `min-h-dvh`. Uji di 360×800 dan 412×915, termasuk keyboard terbuka pada modal form.
6. **Rapikan proyek.** Hapus `express`, `dotenv`, `@google/genai`; ganti nama paket; tambah skrip `test` dan `typecheck`.
7. **Waktu.** Satu modul `time.ts` (`nowWibLabel()`, `nowIso()`), dan semua tampilan memakai `timeZone: 'Asia/Jakarta'`. Simpan timestamp sebagai ISO. Audit log memakai pengguna aktif dan ID `crypto.randomUUID()`.

### 5.7 Peningkatan fitur (opsional, nilai bisnis)

| Saran | Manfaat | Cara singkat |
|---|---|---|
| Kalender/Gantt ketersediaan unit | Operator melihat bentrok sekilas | Komponen timeline berbasis `startEpoch/endEpoch` + buffer, ditampilkan per unit |
| Foto serah terima (kondisi unit) | Bukti saat sengketa kerusakan | Ambil dengan `<input capture>`, kompres ke ≤200 KB, simpan di IndexedDB (bukan localStorage) |
| Deposit dan pembayaran | Rekonsiliasi omset | Field `dp`, `lunas`, `metodeBayar` di booking + kolom Sheets |
| Pengingat servis berbasis KM/tanggal | Mengurangi kerusakan | Aturan per kategori (mis. oli mesin tiap 2.000 km), tampilkan badge di Armada |
| Pelanggan berulang | Tag "langganan" otomatis | Cocokkan nomor WA ternormalisasi lintas booking |
| Laporan bulanan ekspor PDF | Pembukuan | `window.print()` dengan CSS cetak, atau jsPDF |
| Web Share Target | Kirim chat WA langsung ke aplikasi | Tambah `share_target` di manifest dan route `/share` yang memanggil parser |

---

## 6. Roadmap Terprioritas

### Fase 1: Aman dipakai (±2–3 hari kerja)
- [ ] S1, S2, S3: load/simpan aman, clone seed, jangan `setDb` saat gagal
- [ ] S5: `storage.persist()` + backup harian + snapshot sebelum impor
- [ ] S7: `nextId` + kunci submit
- [ ] B1, B3: guard di pembuatan booking, cocokkan `bookingId` saat membatalkan
- [ ] D1: toleransi konsisten
- [ ] I1: satu normalizer, hapus nomor fallback
- [ ] I2: sanitasi dan secret untuk webhook Sheets
- [ ] U1: ikon PWA

### Fase 2: Operasional andal (±1–2 minggu)
- [ ] `applyTransition` tunggal dan `deriveTracking` (B2, B4–B9)
- [ ] Status `dibatalkan` dan perlindungan `diservis`/`selesai`
- [ ] Perbaikan parser lengkap (P1–P9) dengan korpus uji
- [ ] Flush antrean Sheets, skema kolom tunggal (I6, I7)
- [ ] Putuskan nasib Telegram (ringan atau Worker)
- [ ] `useReducer`, update PWA dengan prompt, PIN pengguna

### Fase 3: Pertumbuhan
- [ ] IndexedDB
- [ ] Backend kecil (sinkron multi-perangkat, cron alert, token di server)
- [ ] Kalender/Gantt, foto serah terima, deposit, pengingat servis

---

## 7. Rencana Pengujian

Tambahkan Vitest (`vitest` + `jsdom`) dan skrip `"test": "vitest run"`.

| Modul | Kasus minimum |
|---|---|
| `calculateOvertimePenalty` | Telat 59/60/61 menit untuk 3j, 6j, 9j, 12j, harian; ≥12j + sisa; tarif kosong |
| `isUnitAvailableForRange` | Tepat di batas buffer 60 menit; booking `disewa` yang sudah lewat jadwal; unit `servis` untuk rentang lain; `excludeBookingId` |
| `checkTransition` / `applyTransition` | Semua pasangan status (valid dan tidak); unit tidak dipilih; unit dipegang booking lain |
| `parseWhatsAppBookingChat` | Template baku; ekspor chat dengan timestamp; nilai di baris berikutnya; tanggal `12.10.2026`; tanggal tanpa tahun di Desember; `Lokasi pengembalian`; "KTP" sebagai ID; nomor `+62 08…` |
| `normalizePhone` | Kosong, `+62`, `08`, `8…`, `6208…`, terlalu pendek |
| Storage | JSON korup → salinan mentah tersimpan; kuota penuh → state tidak berubah; impor tanpa `tracking` termigrasi |
| `csvCell` / sanitasi Sheets | `=`, `+`, `-`, `@`, tab; nomor telepon tidak rusak |
| Konkurensi | Dua pembuatan booking untuk unit dan rentang sama → hanya satu berhasil |

Lengkapi dengan uji manual di Android: instal PWA, mode pesawat, isi form lalu putar layar, keyboard terbuka pada modal, backup dan restore.

---

## 8. Pertanyaan Kebijakan untuk Pemilik Bisnis

Jawaban ini menentukan perilaku kode yang benar:

1. **Toleransi 60 menit:** bila telat 61 menit, denda dihitung dari menit ke-61 atau dari seluruh 61 menit (kini: seluruhnya, dibulatkan ke 2 jam)?
2. **Telat tepat 60 menit:** gratis di semua kategori?
3. **Sewa ≥28 hari:** bulan parsial diprorata, dibulatkan, atau ditagih kombinasi minggu+hari termurah?
4. **Booking approved yang tidak diambil:** berapa jam toleransi sebelum unit dilepas?
5. **Unit servis atau di kurir:** apakah boleh menerima booking untuk waktu setelah estimasi selesai?
6. **Data wajib:** apakah alamat KTP, telp darurat, dan ID pendukung wajib sebelum approve?
7. **Pembatalan:** apakah catatan pembatalan harus tetap tersimpan untuk pembukuan (disarankan: ya)?
8. **Pemakai:** apakah lebih dari satu orang/perangkat memakai aplikasi ini (menentukan perlunya backend dan sinkron)?
9. **Alert Telegram:** apakah perlu berjalan saat aplikasi tertutup (menentukan perlunya Worker/cron)?
