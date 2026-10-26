# Changelog

Semua perubahan penting pada proyek ini dicatat dalam berkas ini.
Format berbasis [Keep a Changelog](https://keepachangelog.com/id/1.1.0/),
dan proyek ini menganut [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.5.0] - 2026-10-26

### Ditambahkan
- Status pemesanan baru `ryokou_dibatalkan` pada `BookingStatus` dan `NEXT_STATUS_TRANSITIONS` untuk mekanisme pembatalan lembut (*soft-cancellation*) transaksi tanpa menghapus rekam jejak audit.
- Modul pemisahan kolom Tanggal (`type="date"`) dan Jam (`type="text"`) secara mandiri pada `NewBookingModal.tsx`.
- Fungsi normalisasi waktu fleksibel `normalizeTimeInput` pada `whatsappChatParser.ts` yang mendukung parsing otomatis: `4`, `04`, `4.00`, `4,00`, `04:00` $\rightarrow$ `04:00`, format 24 jam `16.00` $\rightarrow$ `16:00`, dan format menit `9.30` $\rightarrow$ `09:30`.
- Fungsi normalisasi tanggal multi-format `normalizeDateInput` untuk format `YYYY-MM-DD`, `DD/MM/YYYY`, `DD.MM.YYYY`, `DD-MM-YYYY`, serta teks bulan Indonesia ("12 Maret 2025").
- Pencadangan otomatis payload LocalStorage korup ke kunci `ryokourent_db_corrupt_<timestamp>` sebelum melakukan reset aman ke default database.
- Pembuatan snapshot cadangan otomatis `ryokourent_snapshot_<timestamp>` sebelum data ditimpa saat proses impor database JSON.
- Antrean offline sinkronisasi Google Sheets (`offlineSheetsQueue`) dan fungsi `flushOfflineSheetsQueue` untuk retry otomatis webhook saat online.
- Tab filter dan styling badge status "Dibatalkan" pada `BookingsView.tsx` dan `BookingDetailModal.tsx`.

### Diubah
- **Kepatuhan Tarif Deal Awal (F-03 Revisi P0):** Algoritma `calculateDynamicRentalTariff` pada `bookingEngine.ts` strictly berpegang pada kesepakatan awal pelanggan. Durasi 8 hari pada paket `1_hari` dihitung murni $8 \times \text{tarif harian}$, dan dilarang dikonversi sepihak menjadi 1 minggu + 1 hari.
- **Pencegahan Nilai NaN ShortRent:** Menambahkan nilai fallback default pada tarif jam (`harga3Jam || 45000`, `harga6Jam || 60000`, dll.) untuk mencegah kalkulasi `NaN` saat model motor belum memiliki data tarif jam.
- **Proteksi Status Unit Garasi:** Alokasi unit fisik pada pembuatan booking baru (`ryokou_booking` dan `ryokou_approved`) mempertahankan posisi armada sebagai `parkir` di pool garasi (tidak berubah menjadi `disewa` sebelum serah terima fisik).
- **Proteksi Pembatalan & Pelepasan Unit:** Pembatalan hanya diizinkan untuk booking belum aktif, diblokir untuk status `disewa`/`diservis`/`selesai`, dan pelepasan pelacak unit memvalidasi kecocokan ID booking (`t.bookingId === bookingId`).
- **Penyatuan Jalur Migrasi Skema:** Implementasi `migrateDatabase(rawDb)` terpadu yang digunakan bersama oleh `loadDatabase()` dan `importDatabaseJSON()`.
- **Honest WhatsApp Links:** Menghapus nomor tiruan `6281234567890`. Bila nomor HP pelanggan belum diisi, sistem menghasilkan *pure text share link* tanpa nomor dummy.
- **PWA Prompt Update:** Konfigurasi `registerType` pada `VitePWA` (`vite.config.ts`) diubah ke `'prompt'` untuk mencegah reload halaman tiba-tiba saat operator mengisi data sewa.

## [3.4.0] - 2026-10-24

### Ditambahkan
- Fitur **'Log Operasional Harian & Insiden Lapangan'** (`DailyOperationalLogSection.tsx`) langsung pada `DashboardView` untuk mencatat serah terima shift, kendala di lapangan, info cuaca/lalu lintas, kondisi armada, dan instruksi tim.
- Skema database `dailyOperationalLogs` pada LocalStorage (`RyokoDatabase`) dengan mekanisme auto-migrasi aman pada `storageService.ts`.
- Filter klasifikasi 5 kategori: *Serah Terima Shift*, *Insiden Lapangan*, *Lalu Lintas & Cuaca*, *Kondisi Armada*, dan *Instruksi Tim*.
- Filter prioritas bertingkat (*Normal*, *Penting ⚠️*, dan *Darurat 🚨 dengan animasi visual*).
- Opsi pengaitan unit fisik garasi (misal *SCP-01*, *NMAX-01*) dan lokasi kejadian spesifik (misal *Pool Dinoyo*, *Alun-Alun Batu*).
- Form cepat penambahan catatan operasional dengan integrasi otomatis akun staf yang sedang bertugas.
- Fitur 1-klik **Kirim WA** dan **Salin Format WhatsApp** untuk diseminasi instan laporan insiden ke grup koordinasi lapangan.
- Pencatatan mutasi penambahan dan penghapusan log ke dalam riwayat `auditLogs` sistem.

## [3.3.0] - 2026-10-24

### Ditambahkan
- Komponen `MonthlyReportView` yang merangkum total pendapatan, jumlah booking, dan tingkat okupansi armada per bulan menggunakan histori data booking untuk manajemen operasional jangka panjang.
- Perhitungan otomatis Tingkat Okupansi Armada (% Occupancy Rate) berbasis unit-hari tersewa terhadap kapasitas penuh armada garasi 16 unit.
- Grafik dual-axis interaktif Recharts (`ComposedChart`) korelasi pendapatan bulanan (Rp) dan tingkat okupansi (%).
- Tab navigasi baru **"Laporan"** (`reports`) pada Android Bottom Navigation untuk Administrator/Owner (`canViewRevenue`).
- Komponen `RevenueTrendChart` berbasis **Recharts** (^3.10.1) pada `DashboardView` untuk visualisasi tren omset dan intensitas permintaan unit 7 hari terakhir (AreaChart & BarChart).
- Komponen `BookingDetailModal` dengan fitur **Quick Share WhatsApp** untuk menghasilkan 3 template pesan resmi (Konfirmasi Booking, Pengingat Pengembalian, dan Ucapan Terima Kasih).
- Fitur live preview pesan WhatsApp gelap, tombol 1-klik "Kirim ke WhatsApp", dan 1-klik "Salin Pesan" dengan konfirmasi visual.
- Tombol ekspor memo eksekutif laporan manajemen WhatsApp dan cetak PDF pada `MonthlyReportView`.

### Diubah
- Konfigurasi `vite.config.ts` diperbarui menggunakan `import.meta.dirname` menggantikan `__dirname` untuk kompatibilitas native ESM Vite 8.
- Penambahan tombol pintas "Laporan Bulanan & Okupansi" di bagian header rekapitulasi finansial `DashboardView`.
- Kartu transaksi pada `BookingsView` dan modal `DigitalReceiptModal` dilengkapi tombol aksi langsung *Quick Share WA*.

## [3.2.2] - 2026-10-24

### Ditambahkan
- Inisialisasi arsitektur RyokoRent Android APK berbasis LocalStorage.
- Model data `MotorModel`, `PhysicalUnit`, `UnitTracking`, `BookingRecord`, dan `ServiceRecord`.
- Panel Catatan Servis Rutin 7 kategori (Oli Mesin, Oli Gardan, Kampas Rem, Ganti Ban, CVT Part, Aki/Baterai, Servis Kecelakaan).
- Dukungan tarif sewa 1 Bulan menggantikan paket 2 Minggu.
- Status `diservis` pada alur state machine dan posisi armada `kurir` disertai nama kurir penanggung jawab.
- Jeda ketersediaan turnaround buffer disesuaikan menjadi 60 menit.
- Filter rekapitulasi omset & laporan finansial berdasarkan rentang tanggal kustom.
- Integrasi tab Recovery ZLCE Studio untuk pembuatan snapshot pemulihan langsung dari antarmuka aplikasi.
- Fitur WhatsApp lanjutan (tagihan sewa bulanan, surat tugas kurir, pengingat jatuh tempo H-2 jam).

### Diubah
- Sinkronisasi `BLUEPRINT.md` dengan penyesuaian aturan bisnis BR-01, BR-02, BR-04, BR-06, dan penempatan WhatsApp pada Bagian 10.
- Penyederhanaan alur pemesanan tanpa meminta/memblokir NIK KTP.
