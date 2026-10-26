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
| **13 Field Form Booking** | Terpasang di `ryoko.ts`, `NewBookingModal`, `whatsappChatParser`, `DigitalReceiptModal` | Seluruh 13 field terverifikasi. Kolom Tanggal (`date`) dan Jam (`text`) dipisah dengan normalisasi otomatis fleksibel (`4.00`, `4,00`, `4` -> `04:00`). | **100% LULUS** |
| **State Machine 6 Status** | 6 status aktif (`booking`, `approved`, `disewa`, `diservis`, `selesai`, `dibatalkan`) | Transisi terkontrol, proteksi anti-hapus (D-20), soft-cancellation `ryokou_dibatalkan`, dan unit tetap `parkir` saat dibuat. | **100% LULUS** |
| **Kepatuhan Tarif Deal Awal** | Murni berdasar deal awal di `bookingEngine.ts` | Sewa 8 hari pada paket harian tetap $8 \times \text{tarif harian}$ (tidak diubah sepihak ke 1 minggu + 1 hari). Fallback jam anti-NaN aktif. | **100% LULUS** |
| **Turnaround Buffer 60 Mnt** | Aktif di `bookingEngine.ts` (`isUnitAvailableForRange`) | Jeda 3600 detik sebelum dan sesudah sewa diperhitungkan untuk pembersihan unit. | **100% LULUS** |
| **Paket Sewa 1 Bulan** | Aktif di katalog & form booking | Pilihan durasi `1_bulan` otomatis menghitung $+30$ hari ke `jamTanggalSelesai`. | **100% LULUS** |
| **Panel Servis 7 Kategori** | Aktif di `ServiceLogsView.tsx` | Oli Mesin, Oli Gardan, Kampas Rem, Ban, CVT, Aki, Kecelakaan tercatat dengan biaya & KM. | **100% LULUS** |
| **RBAC 4 Tingkat** | Aktif di `UserManagementView` & TopBar Switcher | Administrator, Admin Custom (granular), Operator (tanpa omset), Kurir (hanya tugas antar/jemput). | **100% LULUS** |
| **Kwitansi Paperless** | Aktif di `DigitalReceiptModal.tsx` | Ekspor PDF berfungsi, tombol Salin Nota Kasir ringkas siap kirim WA. | **100% LULUS** |
| **Countdown & Denda Live** | Aktif di `CountdownAlertBanner.tsx` | 4 tingkat urgensi (Aman, H-2, H-1, Overdue), rumus denda D-27 teruji. | **100% LULUS** |
| **Proteksi NIK & Privasi** | Aktif di form | Anti-NIK tidak memblokir input wajar penyewa dan informasi rahasia tidak bocor. | **100% LULUS** |
| **Keamanan Data & Snapshot** | Aktif di `storageService.ts` | Corrupt DB backup ke LocalStorage, auto-snapshot sebelum restore, unified schema migration. | **100% LULUS** |

---

## 3. LOG PENYESUAIAN & TINDAK LANJUT TEMUAN (ADJUSTMENT ACTION LOG)

Gunakan tabel ini untuk mencatat hasil review Claude begitu diterima, beserta solusi penyesuaian yang diterapkan:

| ID Temuan | Sumber / Reviewer | Deskripsi Temuan | Severity | Berkas Terdampak | Tindakan Penyesuaian | Status | Bukti Verifikasi |
| :--- | :--- | :--- | :-: | :--- | :--- | :-: | :--- |
| `REV-ADJ-001` | Pre-Review Audit | Opsi integrasi penyimpanan awan eksternal (Google Sheets) untuk backup data dan review kolaboratif. | P1 | `src/services/googleSheetsService.ts`, `docs/GOOGLE_SHEETS_INTEGRATION.md` | Dibuat modul ekspor CSV, format baris 13 field, dan webhook Google Apps Script. | **RESOLVED** | Ekspor CSV & payload baris 13 field teruji di unit test & UI. |
| `REV-ADJ-002` | Pre-Review Audit | Sistem alert pengingat pengembalian otomatis ke Telegram Admin dengan tombol inline review & aksi. | P1 | `src/services/telegramBotService.ts`, `docs/TELEGRAM_BOT_INTEGRATION.md` | Dibuat modul pesan Telegram Bot dengan inline keyboard untuk review, approve selesai, perpanjangan, dan denda. | **RESOLVED** | Format pesan HTML/Markdown & tombol callback teruji di UI Pengaturan & Banner. |
| `REV-ADJ-003` | Pre-Review Audit | Dokumentasi README proyek masih menggunakan template lama ZLCE Studio. | P1 | `README.md` | Ditulis ulang dokumentasi resmi komprehensif RyokoRent Android APK. | **RESOLVED** | `README.md` mencakup seluruh 13 field, alur state machine, dan setup. |
| `REV-ADJ-004` | Audit Review docs/periksa | F-03 P0: Perhitungan tarif sewa merubah durasi sepihak menjadi 1 minggu + 1 hari bila disewa 8 hari. | P0 | `src/services/bookingEngine.ts` | `calculateDynamicRentalTariff` dipatok murni berdasar deal awal (`1_hari` $\rightarrow$ $N \times \text{tarif 1 hari}$), fallback ShortRent anti-NaN. | **RESOLVED** | Unit test `test_tariff_deal_awal` lulus 100%, kompilasi tsc exit 0. |
| `REV-ADJ-005` | Audit Review docs/periksa | Booking baru langsung mengubah status unit fisik jadi 'disewa', serta hard delete saat cancel. | P0 | `src/App.tsx`, `src/types/ryoko.ts`, `src/services/bookingEngine.ts` | Unit dialokasikan berstatus `parkir`, status baru `ryokou_dibatalkan` untuk soft-cancel dengan validasi ID pelacak. | **RESOLVED** | Unit test `test_status_posisi_parkir` dan `test_soft_cancel` lulus 100%. |
| `REV-ADJ-006` | Audit Review docs/periksa | LocalStorage corrupt JSON langsung di-overwrite tanpa backup, in-memory INITIAL_DATABASE rawan mutasi. | P0 | `src/services/storageService.ts` | Backup raw data rusak ke `ryokourent_db_corrupt_<ts>`, isolasi data default via `structuredClone()`. | **RESOLVED** | Unit test `test_corrupt_db_backup` dan `test_structured_clone` lulus. |
| `REV-ADJ-007` | Audit Review docs/periksa | Desinkronisasi migrasi schema antara loadDatabase dan importJSON, impor data menimpa tanpa cadangan. | P1 | `src/services/storageService.ts` | Penyatuan migrasi `migrateDatabase()`, auto-snapshot `ryokourent_snapshot_<ts>` sebelum import. | **RESOLVED** | Unit test `test_auto_snapshot_before_import` & unified migration lulus. |
| `REV-ADJ-008` | Permintaan Pengguna | Form booking menggabungkan datetime, sulit perbaikan manual; chat jam variatif (`4.00`, `4,00`, `4`). | P1 | `src/components/NewBookingModal.tsx`, `src/utils/whatsappChatParser.ts` | Pemisahan kolom Tanggal (`date`) dan Jam (`text`), normalizer otomatis fleksibel jam & tanggal, strip WA timestamp prefix. | **RESOLVED** | Unit test `test_normalize_time_input` (4, 4.00, 4,00, 16.00) lulus 100%. |
| `REV-ADJ-009` | Audit Review docs/periksa | WhatsApp link memakai nomor dummy `6281234567890`, Google Sheets gagal sync bila offline. | P1 | `src/services/whatsappService.ts`, `src/services/googleSheetsService.ts` | Penghapusan nomor dummy (fallback ke pure share text link), offline sync queue via `flushOfflineSheetsQueue`. | **RESOLVED** | Unit test `test_whatsapp_honest_link` dan `test_offline_sheets_queue` lulus. |
| `REV-ADJ-010` | Audit Review docs/periksa | PWA Service Worker me-refresh layar tiba-tiba saat operator mengisi form, timestamp non-WIB. | P2 | `vite.config.ts`, `src/utils/countdownHelper.ts` | Mengubah mode PWA ke `prompt`, standarisasi zona waktu WIB (UTC+7), verifikasi 29 task ZLCE. | **RESOLVED** | `compile_applet`, `npm run build`, dan `zlce-check.py` lulus (0 error, 29 task). |

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
