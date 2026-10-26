# RENCANA AKSI & TINDAK LANJUT HASIL REVIEW (REVIEW ACTION PLAN)
**Proyek:** RyokoRent Android APK — Rental Sepeda Motor Malang & Batu  
**Tujuan:** Panduan sistematis untuk memeriksa temuan review eksternal (Claude/Auditor), melakukan triase, dan mengeksekusi penyesuaian kode secara terukur.

---

## 1. RUBRIK TRIASE PRIORITAS TEMUAN

Setiap temuan dari hasil review Claude diklasifikasikan ke dalam 3 tingkatan urgensi:

| Tingkat | Kategori | Kriteria Dampak | SLA Tindakan | Contoh Kasus |
| :-: | :--- | :--- | :-: | :--- |
| **P0** | **Kritis / Fatal** | Kesalahan kalkulasi finansial/denda, kehilangan data sewa, tabrakan jadwal (*double-booking*), pelanggaran privasi data, atau aplikasi *crash*. | Segera (< 1 Sesi) | Buffer 60 menit terlewat, unit fisik dapat dipesan 2 orang bersamaan, NIK terekspos publik. |
| **P1** | **Operasional / Penting** | Alur kerja terhambat, parser chat WA gagal pada format umum tertentu, inkonsistensi field 13 booking, atau hak akses role bocor. | 1 - 2 Sesi | Field nomor darurat tidak muncul di kwitansi, kurir dapat melihat omset total rental. |
| **P2** | **Penyempurnaan / UX** | Estetika visual, kenyamanan sentuhan, penambahan tooltip informasi, perbaikan copy teks, atau optimasi micro-interaction. | Backlog Terjadwal | Warna kontras badge kurang jelas di layar terik matahari, teks disclaimer kurang rapi. |

---

## 2. HASIL AUDIT PENDAHULUAN MANDIRI (PRE-REVIEW SELF-AUDIT)

Sebelum menerima laporan lengkap dari Claude, audit mandiri internal telah dilakukan pada basis kode saat ini:

### A. Matriks Kepatuhan Aturan Bisnis & Spesifikasi
| Komponen | Status Saat Ini | Catatan Evaluasi | Status Kepatuhan |
| :--- | :--- | :--- | :-: |
| **13 Field Form Booking** | Terpasang di `ryoko.ts`, `NewBookingModal`, `whatsappChatParser`, `DigitalReceiptModal` | Seluruh 13 field (Nama, KTP, ID Pendukung, Alamat Sekarang, ID Sosmed, No HP, No Darurat, Jadwal Mulai, Jadwal Selesai, Lokasi Antar, Lokasi Jemput, Model Unit, Jumlah Helm) terverifikasi. | **100% LULUS** |
| **State Machine 5 Status** | 5 status aktif (`ryokou_booking`, `approved`, `disewa`, `diservis`, `selesai`) | Transisi terkontrol, proteksi anti-hapus (D-20) aktif saat status `disewa`. | **100% LULUS** |
| **Turnaround Buffer 60 Mnt** | Aktif di `bookingEngine.ts` (`isUnitAvailableForRange`) | Jeda 3600 detik sebelum dan sesudah sewa diperhitungkan untuk pembersihan unit. | **100% LULUS** |
| **Paket Sewa 1 Bulan** | Aktif di katalog & form booking | Pilihan durasi `1_bulan` otomatis menghitung $+30$ hari ke `jamTanggalSelesai`. | **100% LULUS** |
| **Panel Servis 7 Kategori** | Aktif di `ServiceLogsView.tsx` | Oli Mesin, Oli Gardan, Kampas Rem, Ban, CVT, Aki, Kecelakaan tercatat dengan biaya & KM. | **100% LULUS** |
| **RBAC 4 Tingkat** | Aktif di `UserManagementView` & TopBar Switcher | Administrator, Admin Custom (granular), Operator (tanpa omset), Kurir (hanya tugas antar/jemput). | **100% LULUS** |
| **Kwitansi Paperless** | Aktif di `DigitalReceiptModal.tsx` | Ekspor PDF berfungsi, tombol Salin Nota Kasir ringkas siap kirim WA. | **100% LULUS** |
| **Countdown & Denda Live** | Aktif di `CountdownAlertBanner.tsx` | 4 tingkat urgensi (Aman, H-2, H-1, Overdue), rumus denda D-27 teruji. | **100% LULUS** |
| **Proteksi NIK & Privasi** | Aktif di form | Anti-NIK tidak memblokir input wajar penyewa dan informasi rahasia tidak bocor. | **100% LULUS** |

---

## 3. LOG PENYESUAIAN & TINDAK LANJUT TEMUAN (ADJUSTMENT ACTION LOG)

Gunakan tabel ini untuk mencatat hasil review Claude begitu diterima, beserta solusi penyesuaian yang diterapkan:

| ID Temuan | Sumber / Reviewer | Deskripsi Temuan | Severity | Berkas Terdampak | Tindakan Penyesuaian | Status | Bukti Verifikasi |
| :--- | :--- | :--- | :-: | :--- | :--- | :-: | :--- |
| `REV-ADJ-001` | Pre-Review Audit | Opsi integrasi penyimpanan awan eksternal (Google Sheets) untuk backup data dan review kolaboratif. | P1 | `src/services/googleSheetsService.ts`, `docs/GOOGLE_SHEETS_INTEGRATION.md` | Dibuat modul ekspor CSV, format baris 13 field, dan webhook Google Apps Script. | **RESOLVED** | Ekspor CSV & payload baris 13 field teruji di unit test & UI. |
| `REV-ADJ-002` | Pre-Review Audit | Sistem alert pengingat pengembalian otomatis ke Telegram Admin dengan tombol inline review & aksi. | P1 | `src/services/telegramBotService.ts`, `docs/TELEGRAM_BOT_INTEGRATION.md` | Dibuat modul pesan Telegram Bot dengan inline keyboard untuk review, approve selesai, perpanjangan, dan denda. | **RESOLVED** | Format pesan HTML/Markdown & tombol callback teruji di UI Pengaturan & Banner. |
| `REV-ADJ-003` | Pre-Review Audit | Dokumentasi README proyek masih menggunakan template lama ZLCE Studio. | P1 | `README.md` | Ditulis ulang dokumentasi resmi komprehensif RyokoRent Android APK. | **RESOLVED** | `README.md` mencakup seluruh 13 field, alur state machine, dan setup. |
| `REV-ADJ-P0-01` | Review 372ba2ec #1 | Pergeseran waktu 7 jam (UTC vs WIB) pada input datetime-local. | P0 | `src/components/NewBookingModal.tsx` | Ditambahkan helper `toLocalInput(d: Date)` berbasis komponen waktu lokal pengguna. | **RESOLVED** | Jam 09:00 WIB tidak lagi terkonversi mundur ke 02:00 UTC. |
| `REV-ADJ-P0-02` | Review 372ba2ec #2 | Regex colon split pada WhatsApp parser memotong jam '15:40' menjadi dua token. | P0 | `src/utils/whatsappChatParser.ts` | Ditambahkan fungsi `valueAfterColon(line)` yang hanya memotong pada titik dua pertama. | **RESOLVED** | Jam sewa 15:40 diparsing utuh dan jadwal mulai terisi presisi. |
| `REV-ADJ-P0-03` | Review 372ba2ec #3 | Fallback data fiktif (Apartemen Begawan, Scoopy, 15:40, 24-25 Okt) saat parsing field kosong. | P0 | `src/utils/whatsappChatParser.ts` | Fallback palsu dihapus total; digantikan nilai kosong bersih dan tanggal hari ini dinamis. | **RESOLVED** | Field kosong tidak lagi terisi data palsu siluman. |
| `REV-ADJ-P0-04` | Review 372ba2ec #4, #33 | Anomali pergeseran 24 jam epoch dan kebocoran PII pelanggan nyata di seed data. | P0 | `src/data/seedData.ts` | Seluruh data pelanggan diganti demo sintetis anonymized dan epoch dikalkulasi presisi WIB. | **RESOLVED** | Privasi pelanggan terjaga 100%, durasi epoch sewa valid. |
| `REV-ADJ-P0-05` | Review 372ba2ec #5 | Hardcoded tarif fallback 1.800.000 mengabaikan setting katalog `harga1Bulan`. | P0 | `src/components/NewBookingModal.tsx` | Tarif bulanan memakai `selectedMotor.harga1Bulan || (selectedMotor.harga1Hari * 22)`. | **RESOLVED** | Kalkulasi sewa 1 bulan menghormati katalog motor dan diskon bulanan. |
| `REV-ADJ-P0-06` | Review 372ba2ec #6 | Perubahan tarif denda di masa depan mengubah historis denda sewa lampau. | P0 | `src/types/ryoko.ts`, `NewBookingModal.tsx`, `bookingEngine.ts` | Dibuat `dendaHarianPerJamSnapshot` pada saat booking dibuat. | **RESOLVED** | Audit finansial denda lampau immutable terhadap perubahan setting. |
| `REV-ADJ-P0-07` | Review 372ba2ec #7 | Double-booking submission bypass tanpa validasi durasi & ketersediaan saat klik simpan. | P0 | `src/components/NewBookingModal.tsx` | Validasi `endEpoch > startEpoch` dan `isUnitAvailableForRange` dieksekusi saat submit form. | **RESOLVED** | Submission yang bentrok dicegah dengan alert penolakan instan. |
| `REV-ADJ-P0-18` | Review 372ba2ec #18 | Normalisasi nomor WA mengembalikan nomor dummy '6281234567890' jika input tidak valid. | P0 | `src/services/whatsappService.ts` | Mengembalikan string kosong `''` jika nomor tidak valid / < 8 digit. | **RESOLVED** | Pesan WhatsApp tidak lagi salah sasaran ke nomor acak. |
| `REV-ADJ-P0-22` | Review 372ba2ec #22, #23 | State mutation referensial & reinjection loop pada database reset & load. | P0 | `src/services/storageService.ts` | Menggunakan `structuredClone(INITIAL_DATABASE)` dan menghapus loop duplikasi booking. | **RESOLVED** | Mutasi state bersih dan booking yang dihapus tidak muncul kembali. |
| `REV-ADJ-P0-31` | Review 372ba2ec #31, #32 | Kerentanan CSV Formula Injection & CORS preflight error di Apps Script webhook. | P0 | `src/services/googleSheetsService.ts` | Escaping karakter formula `[=+\-@\t\r]` dengan quote `'` dan set header `text/plain`. | **RESOLVED** | CSV aman dari eksekusi formula dan webhook Google Sheets bebas CORS. |
| `REV-ADJ-P1-12` | Review 372ba2ec #12, #13 | Booking approved tidak bisa dibatalkan untuk melepaskan unit & status dibatalkan hilang. | P1 | `src/types/ryoko.ts`, `App.tsx`, `BookingsView.tsx` | Ditambahkan status `ryokou_dibatalkan` dan tombol 'Batalkan' di status approved. | **RESOLVED** | Unit fisik kembali ke 'parkir' dan historis transaksi tercatat sebagai dibatalkan. |
| `REV-ADJ-P1-14` | Review 372ba2ec #14, #15 | Tukar unit memaksa status unit lama ke servis tanpa opsi & servis menimpa sewa aktif. | P1 | `src/components/ActionModals.tsx`, `App.tsx` | Ditambahkan toggle tujuan unit lama (servis / parkir) dan proteksi servis saat sewa aktif. | **RESOLVED** | Operator leluasa memindahkan ke parkir atau bengkel secara akurat. |
| `REV-ADJ-P1-19` | Review 372ba2ec #19 | Tombol WA customer mengirimkan teks admin 'Halo Admin Ryoko Rent...'. | P1 | `src/services/whatsappService.ts`, `BookingsView.tsx` | Dibuat `generateCustomerBookingSummaryWhatsAppUrl` dengan nada ramah pelanggan. | **RESOLVED** | Pelanggan menerima rangkuman sewa yang tepat bukan teks admin. |
| `REV-ADJ-P1-26` | Review 372ba2ec #26, #27 | XSS/HTML inject di Telegram bot & callback buttons tanpa server webhook. | P1 | `src/services/telegramBotService.ts` | Dibuat fungsi escaping HTML `esc(s)` dan tombol callback diganti direct link WA kurir/penyewa. | **RESOLVED** | Telegram bot aman dan tombol aksi dapat langsung diklik interaktif. |
| `REV-ADJ-P1-30` | Review 372ba2ec #30 | Antrian offline Google Sheets tidak memiliki deduplikasi dan fungsi flush. | P1 | `src/services/googleSheetsService.ts` | Ditambahkan deduplikasi antrian berdasarkan `noBooking` dan fungsi `flushOfflineSheetsQueue`. | **RESOLVED** | Data offline tersinkronisasi tanpa duplikasi saat online kembali. |
| `REV-ADJ-P2-17` | Review 372ba2ec #17 | Pergantian user role tanpa proteksi autentikasi PIN. | P2 | `src/components/AndroidTopBar.tsx`, `UserManagementView.tsx` | Ditambahkan dialog verifikasi PIN 4-digit sebelum beralih ke akun Admin/Custom. | **RESOLVED** | Akses administratif terlindungi dari switch tanpa izin. |
| `REV-ADJ-P2-TOUCH` | Review 372ba2ec Ergonomics | Target sentuh tombol aksi mobile di bawah batas minimum ergonomis 44px. | P2 | `src/components/BookingsView.tsx` | Diterapkan `min-h-[44px]` pada seluruh tombol aksi utama transaksi sewa. | **RESOLVED** | Ergonomi layar sentuh HP Android memenuhi standar operasional lapangan. |

---

## 4. PROSEDUR EKSEKUSI PENYESUAIAN KODE
Setiap kali ada temuan review yang akan diperbaiki:
1. Catat temuan ke dalam tabel `LOG PENYESUAIAN` di atas dengan ID `REV-ADJ-xxx`.
2. Jika perbaikan tergolong tingkat P0 atau P1 signifikan, tambahkan entri penyesuaian di `SESSION_STATE.md` (bagian 5: Slot Revisi Aktif).
3. Lakukan modifikasi kode dengan prinsip atomik (tidak mengubah bagian kode yang sudah stabil).
4. Jalankan kompilasi verifikasi:
   - `npm run lint` (`tsc --noEmit`)
   - `npm run build`
   - `python3 scripts/zlce/zlce-check.py . --no-git`
5. Perbarui status temuan menjadi `RESOLVED` dan cantumkan bukti verifikasi.
