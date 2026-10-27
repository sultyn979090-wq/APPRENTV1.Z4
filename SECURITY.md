# Kebijakan Keamanan (Security Policy)

Dokumen ini mendefinisikan postur keamanan dan pedoman privasi data untuk aplikasi **RyokoRent Android PWA** (v3.5.0) serta modul pengembang **ZLCE Studio** (v3.2.2).

---

## 1. Arsitektur Privasi & Penyimpanan Data

1. **Penyimpanan Lokal Terproteksi (Client-Side Persistence)**:
   - Aplikasi RyokoRent beroperasi secara offline-first dengan seluruh data operasional (transaksi pemesanan, catatan servis, tracking unit, dan log harian) disimpan secara lokal di `localStorage` peramban pengguna.
   - Proteksi otomatis korupsi data aktif: payload tidak valid dicadangkan ke kunci `ryokourent_db_corrupt_<timestamp>` untuk mencegah kehilangan data pelanggan.
   - Fitur ekspor/impor JSON membuat auto-snapshot `ryokourent_snapshot_<timestamp>` sebelum data ditimpa.

2. **Perlindungan Data Pribadi (PII Protection)**:
   - Nomor Induk Kependudukan (NIK 16-digit) disamarkan secara otomatis (`************XXXX`) pada log audit dan tampilan publik untuk mencegah kebocoran identitas penyewa.
   - Nomor WhatsApp pelanggan dinormalisasi tanpa nomor tiruan/dummy untuk mencegah salah kirim data transaksi.

3. **Isolasi Kredensial & Rahasia Lingkungan**:
   - Dilarang keras menuliskan kunci API privat (mis. token Bot Telegram, URL webhook Google Apps Script) ke dalam berkas kontrol `SESSION_STATE.md`, `TASKS.md`, maupun snapshot git.
   - Gunakan selalu konfigurasi `.env` lokal atau menu Pengaturan aplikasi yang tersimpan secara terisolasi di perangkat admin.

---

## 2. Pelaporan Kerentanan (Reporting a Vulnerability)

Jika Anda menemukan celah keamanan atau potensi kerentanan data pada aplikasi RyokoRent atau ZLCE:
- Mohon untuk **tidak mempublikasikan** temuan tersebut secara terbuka di repositori atau forum publik.
- Laporkan secara bertanggung jawab kepada tim pengelola proyek melalui jalur komunikasi privat atau Security Advisory GitHub.
- Tim kami berkomitmen meninjau dan merilis perbaikan dalam kurun waktu 1–3 hari kerja.
