# PROMPT SIAP SALIN UNTUK CODE REVIEW CLAUDE
**Gunakan prompt di bawah ini langsung di obrolan Claude bersama berkas lampiran yang ditentukan di `docs/CLAUDE_REVIEW_GUIDE.md`.**

```markdown
Anda adalah seorang Principal Software Architect & Senior Code Auditor yang ahli dalam arsitektur React 19, TypeScript, Progressive Web Apps (PWA), sistem reservasi armada rental otomotif, dan metodologi Zero-Loss Context Engineering (ZLCE).

Saya telah melampirkan berkas inti dari aplikasi "RyokoRent Android APK" — sebuah sistem administrasi dan operasional rental sepeda motor untuk wilayah Malang & Kota Batu. 

Tolong lakukan tinjauan kode (Comprehensive Code & Architecture Review) secara mendalam, objektif, dan kritis berdasarkan berkas-berkas yang terlampir.

---

### FOKUS UTAMA TINJAUAN:

1. **Kepatuhan Form Template Booking 13 Field & Pemisahan Kolom:**
   - Periksa konsistensi 13 field standar: (1) Nama, (2) Alamat KTP, (3) ID Pendukung (SIM C, KTM, NPWP, Paspor, BPJS), (4) Alamat Saat Ini (rumah/kos/hotel di Malang/Batu), (5) ID Sosmed (IG/TikTok/FB), (6) Nomor Telepon, (7) Nomor Telepon Darurat, (8) Jadwal Mulai, (9) Jadwal Selesai, (10) Lokasi Pengantaran, (11) Lokasi Penjemputan, (12) Model Unit Motor, (13) Jumlah Helm SNI (1 atau 2).
   - Periksa pemisahan kolom input Tanggal (`type="date"`) dan Jam (`type="text"`) mandiri dengan normalizer fleksibel (`normalizeTimeInput` untuk `4`, `4.00`, `4,00`, `04:00` -> `04:00`).
   - Apakah parser WhatsApp chat (`whatsappChatParser.ts`) dapat mengekstrak teks chat acak pelanggan serta membersihkan metadata timestamp WhatsApp export?
   - Apakah seluruh 13 field ini terpetakan di form modal, nota kwitansi paperless, dan pesan WhatsApp?

2. **Kekokohan State Machine & Logika Bisnis:**
   - Evaluasi transisi 6 status: `ryokou_booking` (Pemesanan Baru) -> `ryokou_approved` (Unit Dikunci) -> `ryokou_disewa` (Sedang Jalan) -> `ryokou_diservis` (Perbaikan Bengkel) -> `ryokou_selesai` (Unit Kembali) dan `ryokou_dibatalkan` (Soft-Cancel).
   - Pastikan alokasi unit garasi saat booking baru mempertahankan posisi `parkir` (tidak langsung berubah `disewa` sebelum serah terima).
   - Validasi kepatuhan aturan deal awal tarif (F-03 P0): Sewa 8 hari pada paket harian tetap $8 \times \text{tarif harian}$, tidak diubah sepihak menjadi 1 minggu + 1 hari.
   - Validasi algoritma bentrok jadwal dengan jeda turnaround buffer 60 menit (`isUnitAvailableForRange`). Apakah ada potensi race condition atau celah double-booking?
   - Validasi mekanisme proteksi anti-hapus pada booking berstatus aktif (D-20) dan proteksi pembatalan.
   - Evaluasi rumus denda keterlambatan (step-up tier untuk ShortRent jam dan denda per jam untuk sewa harian/bulanan dengan toleransi 60 menit).

3. **Manajemen Armada, Kurir & 7 Kategori Servis:**
   - Status posisi armada: `parkir` (Pool Malang Dinoyo / Pool Batu Sisir), `kurir` (disertai nama kurir penanggung jawab), `disewa`, dan `servis`.
   - Modul pencatatan 7 kategori servis rutin: Oli Mesin, Oli Gardan, Kampas Rem, Ganti Ban, CVT Part, Aki, Kecelakaan.

4. **Keamanan, Ketahanan Database & Kebijakan Anti-NIK:**
   - Pastikan tidak ada data NIK KTP yang terekspos secara publik atau divalidasi dengan cara yang memblokir pengguna secara tidak wajar.
   - Evaluasi ketahanan LocalStorage: pencadangan otomatis payload korup ke `ryokourent_db_corrupt_<timestamp>`, auto-snapshot sebelum restore/impor, dan `structuredClone` untuk isolasi mutasi data.

5. **Kesiapan PWA Android & Mobile Responsiveness:**
   - Tinjau tata letak komponen antarmuka untuk viewport layar smartphone Android (lebar 360px - 412px), mode update PWA `prompt`, akses navigasi jempol satu tangan, dan mode PWA standalone.

6. **Integrasi Eksternal (WhatsApp, Google Sheets, Telegram Bot):**
   - Tinjau tautan WhatsApp jujur (*honest links* tanpa nomor dummy `6281234567890`).
   - Tinjau antrean sinkronisasi offline Google Sheets (`flushOfflineSheetsQueue`).
   - Tinjau kesiapan integrasi bot Telegram untuk alert pengembalian real-time dan callback inline keyboard.

---

### STRUKTUR LAPORAN REVIEW YANG DIHARAPKAN:

Tolong sajikan hasil review Anda dalam format laporan terstruktur berikut:

1. **Executive Summary:** Ringkasan penilaian kualitas kode, arsitektur, dan stabilitas operasional (skor 1-100).
2. **Kelebihan Arsitektur (Strong Points):** Bagian yang sudah dirancang dengan sangat baik dan patut dipertahankan.
3. **Temuan Kritis & Potensi Bug (Defects & Vulnerabilities):** Celah keamanan, bug logika, potensi data hilang, atau edge case yang belum tertangani.
4. **Matriks Evaluasi Kepatuhan Aturan Bisnis:** Tabel evaluasi terhadap BR-01 sampai BR-08 serta 13 field form booking.
5. **Rekomendasi Penyesuaian Terprioritas (Prioritized Action Items):**
   - **Tingkat P0 (Kritis / Segera):** Perbaikan yang memengaruhi integritas data atau kesalahan kalkulasi.
   - **Tingkat P1 (Penting / Operasional):** Peningkatan keandalan alur kerja operasional rental & kurir.
   - **Tingkat P2 (Penyempurnaan / UX):** Peningkatan estetika antarmuka, micro-interaction, dan kenyamanan pengguna.
6. **Contoh Cuplikan Kode Rekomendasi (Code Snippets):** Berikan contoh kode konkret perbaikan jika ada modul yang perlu disempurnakan.
```
