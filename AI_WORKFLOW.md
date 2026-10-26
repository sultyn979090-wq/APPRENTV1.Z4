# TATA KELOLA AI, ALUR KERJA & STANDAR TEKNIS: RyokoRent Android APK

> **Metodologi:** Zero-Loss Context Engineering (ZLCE) v3.3.0  
> **Status:** Otoritatif — Satu-satunya definisi aturan kerja agen, konvensi, enum status, triase, git, checkpoint, dan protokol pemulihan. Berkas lain merujuk ke sini.

---

## 1. KONVENSI TEKNIS

1. **Bahasa Dokumentasi:** Teknis murni, ringkas, format bullet points atau tabel, tanpa narasi bertele-tele atau spekulasi.
2. **Waktu & Zona:** Seluruh pencatatan waktu menggunakan standar WIB (UTC+07:00 / `Asia/Jakarta`). Format: `YYYY-MM-DD HH:mm:ss WIB` atau `YYYY-MM-DD jam: ?` bila jam tidak dinyatakan secara eksplisit.
3. **Penamaan Kode:**
   - Direktori & Berkas: `kebab-case` untuk utilitas/skrip, `PascalCase.tsx` untuk komponen React.
   - Komponen & Tipe/Interface: `PascalCase` (contoh: `BookingRecord`, `NewBookingModal`).
   - Fungsi & Variabel: `camelCase` (contoh: `calculateDynamicRentalTariff`, `isUnitAvailableForRange`).
   - Konstanta Global & Enums: `UPPER_SNAKE_CASE` (contoh: `STORAGE_KEY`, `TURNAROUND_BUFFER_SECONDS`).

---

## 2. ENUM STATUS TUNGGAL

Status task hanya boleh bernilai salah satu dari enum berikut:
`PENDING | READY | IN_PROGRESS | BLOCKED | DONE`

| Status | Makna & Ketentuan |
| :--- | :--- |
| `PENDING` | Dependensi task belum berstatus `DONE`. Belum boleh dikerjakan. |
| `READY` | Seluruh dependensi telah berstatus `DONE`, task siap dikerjakan. |
| `IN_PROGRESS` | Sedang dikerjakan (**maksimal 1 task** pada satu waktu). |
| `BLOCKED` | Terhenti sementara akibat kendala teknis atau preempt revisi; alasan wajib dicatat di `SESSION_STATE.md`. |
| `DONE` | Seluruh Kriteria Penerimaan (AC) terpenuhi + bukti verifikasi teruji + disetujui pengguna (`Disetujui: ya`). |

*Catatan:* Nilai status di luar kelima enum tersebut dilarang keras di seluruh dokumen kontrol.

---

## 3. GUARDRAIL AGEN AI

1. **Integritas Berkas Kontrol:** Dilarang menghapus atau mengganti nama berkas kontrol tanpa persetujuan tertulis eksplisit dari pengguna.
2. **Disiplin Satu Task:** Hanya ada tepat satu task berstatus `IN_PROGRESS` pada satu waktu.
3. **Smart Read-Before-Write:** Wajib membaca kode atau dokumen terkait sebelum melakukan pengeditan atau mutasi berkas.
4. **Anti-Halusinasi & Ketidakpastian:** Informasi di luar dokumen/lampiran dianggap tidak diketahui. Wajib dicatat sebagai asumsi (`ASM-xx`) atau pertanyaan terbuka (`Q-xx`) di `SESSION_STATE.md` Bagian 4.
5. **Verifikasi Library:** Verifikasi API library dan kesesuaian versi sebelum ditulis dalam kode; catat dependensi di `BLUEPRINT.md`.
6. **Kejujuran Bukti Pengujian:** Dilarang mengarang output pengujian, linting, atau build. Bukti verifikasi harus berasal dari eksekusi nyata.
7. **Keamanan Kredensial:** Kredensial rahasia (token, kunci API) disimpan di `.env.example` sebagai variabel kosong dan tidak boleh ditulis langsung (*hardcoded*) di repositori.
8. **Aturan X1 (Anti-Ekstrapolasi Waktu):** Dilarang mengarang atau memajukan jam secara sintetis (+5 atau +10 menit). Gunakan timestamp audit resmi atau fallback `jam: ?`.

---

## 4. PEMBACAAN BERTINGKAT (TIER ARCHITECTURE)

| Tier | Lingkup Dokumen | Waktu Baca |
| :-: | :--- | :--- |
| **Tier 0** | `SESSION_STATE.md`, entri task aktif di `TASKS.md` | Setiap awal sesi baru atau serah terima |
| **Tier 1** | Berkas pada `Docs Terkait` task aktif + kode sumber yang disentuh | Sebelum mengeksekusi langkah task |
| **Tier 2** | `BLUEPRINT.md`, `README.md`, dan dokumentasi integrasi lainnya | Hanya bila diperlukan klarifikasi arsitektur |

---

## 5. ATURAN VERIFIKASI SEBELUM SELESAI (DONE)

1. Status `DONE` hanya sah bila: seluruh AC terpenuhi, kolom Bukti Verifikasi terisi konkret, dan `Disetujui: ya`.
2. Bukti verifikasi berupa output eksekusi konkret (contoh: `npm run test 7/7 lolos`, `tsc --noEmit 0 error`, `build lolos`).
3. Seluruh dokumen yang terdaftar pada `Docs Impact` wajib disinkronkan sebelum task ditandai `DONE`.
4. `SESSION_STATE.md` wajib diperbarui pada setiap perubahan status task, commit, dan langkah WAL.

---

## 6. PROTOKOL TRIASE REVISI (INTERRUPT PROTOCOL)

| Level | Kriteria Perubahan | Prosedur Penanganan |
| :-: | :--- | :--- |
| **Level S** | $\le 1$ berkas, $\le 20$ baris, tanpa perubahan skema/kontrak/dependensi/AC | Eksekusi langsung; tandai `[MINOR]`; catat di `CHANGELOG.md` |
| **Level M / L** | Menyangkut banyak berkas, perubahan skema, jalur build, atau fitur baru | Ikuti prosedur jeda (preempt) di bawah |

**Prosedur Preempt Level M / L:**
1. Tangkap parameter revisi dari pengguna.
2. Jeda task aktif yang sedang berjalan: ubah statusnya menjadi `BLOCKED` (alasan: preempted oleh revisi), simpan konteks WAL ke `Catatan Serah Terima`.
3. Daftarkan task baru di `TASKS.md` dan matriks `SESSION_STATE.md` lengkap dengan dependensi, AC, dan Docs Impact.
4. Eksekusi task revisi, verifikasi hingga `DONE`.
5. Kembalikan task reguler ke `IN_PROGRESS` (pulihkan WAL dari Catatan Serah Terima) dan lanjutkan.

---

## 7. STANDAR GIT & COMMIT CONVENTION

Format pesan commit mengikuti standar Conventional Commits:
```text
<tipe>(<lingkup>): <deskripsi imperatif> [TASK-XXX | MINOR]
```
- **Tipe Sah:** `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `wip`.
- **Commit Titik-Simpan:** `wip(<lingkup>): <langkah> [TASK-XXX]` digunakan untuk melindungi dari sesi terputus pada langkah multi-berkas.
- **Branch Fitur:** `feature/<task-id>-<slug>`, di-merge ke `main` setelah seluruh pengujian dan build lolos.

---

## 8. CHECKPOINT & WRITE-AHEAD LOGGING (WAL)

Prinsip dasar ZLCE: Sesi dapat terputus sewaktu-waktu (kuota habis, timeout jaringan, tab tertutup). Konteks yang selamat adalah yang tertulis di berkas kontrol.

1. **Protokol WAL (Write-Ahead Logging):** Sebelum langkah yang menyentuh $> 1$ berkas, isi Bagian 3 `SESSION_STATE.md`:
   - `Task`: ID task aktif.
   - `Langkah Sedang Dikerjakan`: Deskripsi spesifik langkah.
   - `Berkas Direncanakan/Disentuh`: Daftar path berkas.
   - `Langkah Berikutnya (persis)`: Perintah/aksi berikutnya.
   - `Perintah Verifikasi`: Perintah pengujian/validasi.
2. **Pembersihan WAL:** Kosongkan seluruh field WAL (kembali ke `-`) segera setelah task berstatus `DONE`.
3. **Format Checkpoint Block:** Untuk serah terima sesi tanpa eksekusi langsung, cetak blok checkpoint standar:
   ```text
   === ZLCE CHECKPOINT [YYYY-MM-DD HH:mm:ss WIB] ===
   ## 1. STATUS AKTIF
   ## 2. MATRIKS TASK (baris berubah)
   ## 3. WORK IN PROGRESS (WAL)
   ## 6. CATATAN SERAH TERIMA
   ## 7. LOG AUDIT (entri terbaru)
   === END CHECKPOINT ===
   ```
4. **Validasi Skrip Otomatis:** Jalankan `python3 scripts/zlce/zlce-check.py . --no-git` untuk memastikan status repositori lolos 0 error dan 0 warning.

---

## 9. PROTOKOL PEMULIHAN SESI (RECOVERY PROTOCOL)

Jika sesi terputus dan dilanjutkan oleh agen baru, jalankan diagnosis status berdasarkan klasifikasi kasus:

| Kasus | Kondisi Repositori | Tindakan Pemulihan |
| :-: | :--- | :--- |
| **Kasus A** | Working tree bersih, tidak ada perubahan berkas | Langkah WAL belum tersimpan: ulangi pekerjaan dari `Langkah Berikutnya`. |
| **Kasus B** | Ditemukan modifikasi lokal pada berkas yang terdaftar di WAL | Nilai kelengkapan kode terhadap AC, selesaikan, jalankan verifikasi; DILARANG mereset atau membuang diff. |
| **Kasus C** | Ditemukan commit baru yang belum tercermin di state | Sinkronkan `SESSION_STATE.md` dengan commit tersebut; jalankan verifikasi ulang. |
| **Kasus D** | Ada perubahan pada berkas di luar daftar WAL | Laporkan anomali kepada pengguna; jangan disentuh tanpa persetujuan. |

---

## 10. SPESIFIKASI MODE LITE (RYOKORENT APK)

Proyek ini beroperasi dalam **MODE LITE** dengan profil domain `booking`:
1. **Berkas Kontrol Inti:** `BLUEPRINT.md`, `TASKS.md`, `SESSION_STATE.md`, `HANDOVER.md`, `AI_WORKFLOW.md`, `CHANGELOG.md`.
2. **Penyatuan Spesifikasi:** Model data terpadu tercakup di `BLUEPRINT.md` Bagian 7; strategi verifikasi & batas beku PWA tercakup di `BLUEPRINT.md` Bagian 8 & 11.
3. **Dokumentasi Terkait:** `Docs Terkait` dan `Docs Impact` hanya merujuk dokumen yang aktif dalam repositori.
4. **Verifikasi Suite Test:** Setiap perubahan logika bisnis wajib diverifikasi melalui test suite `npm run test` (`tests/business-logic.test.ts`).

---

## 11. MATRIKS SITUASI KERJA & JALUR OPERASIONAL (KONSOLIDASI USAGE)

### 11.1 Matriks Situasi Kerja
| Situasi Kerja | Tindakan & Prosedur |
| :--- | :--- |
| **Memulai Proyek Baru** | Gunakan `LANDING_PROMPT.md` (Aksi: `BARU`) + kit generator di `zlce-kit/`. |
| **Melanjutkan Sesi / Pindah AI** | Gunakan prompt `HANDOVER.md` + lampirkan `SESSION_STATE.md`. |
| **Restrukturisasi Proyek Existing** | Gunakan `LANDING_PROMPT.md` (Aksi: `RESTRUKTURISASI`). Audit read-only sebelum mutasi kode. |
| **Validasi State Repositori** | Jalankan `python3 scripts/zlce/zlce-check.py . --no-git` di terminal. |
| **Sesi Terputus Tiba-Tiba** | Jalankan `bash scripts/zlce/zlce-snapshot.sh --diff` atau buka tab **Recovery** di UI APK. |

### 11.2 Tiga Jalur Kerja Operasional
1. **Jalur 1: Proyek Baru (Mulai dari Nol)**: Inisiasi via Landing Prompt $\rightarrow$ 4 Gerbang Kualitas bertahap (Blueprint $\rightarrow$ Arsitektur $\rightarrow$ Tasks $\rightarrow$ Session State) $\rightarrow$ Eksekusi atomik 1 task per waktu.
2. **Jalur 2: Lanjut Sesi / Recovery**: Ambil `SESSION_STATE.md` $\rightarrow$ generate snapshot diff bila terputus $\rightarrow$ buka sesi baru dengan prompt `HANDOVER.md` $\rightarrow$ klasifikasikan Kasus A, B, C, atau D.
3. **Jalur 3: Proyek Existing**: Audit menyeluruh tanpa mengubah kode $\rightarrow$ tuangkan temuan ke `BLUEPRINT.md` dan backlog `TASKS.md` $\rightarrow$ eksekusi refactoring terisolasi berbukti.

---

## 12. CHECKLIST KUALITAS PRE-MERGE & PRE-PRODUCTION

### 12.1 Pre-Merge Checklist
- [x] **Integritas PWA:** Seluruh berkas beku Kelompok A dan 6 titik kopling kritis (K1-K6) terjaga.
- [x] **Type Checking & Linting:** `npm run lint` (`tsc --noEmit`) lolos dengan 0 error.
- [x] **Test Suite:** `npm run test` (`tests/business-logic.test.ts`) lolos 7/7 kasus uji (25/25 assertions pass).
- [x] **Bundle Produksi:** `npm run build` sukses, `dist/` terverifikasi memiliki `sw.js` & `manifest.webmanifest` tanpa berkas `.md`.
- [x] **Validator ZLCE:** `python3 scripts/zlce/zlce-check.py . --no-git` lolos `RESULT: OK (0 error, 0 warn)`.
- [x] **Audit State:** `SESSION_STATE.md` mencatat seluruh bukti verifikasi dan disetujui pengguna (`Disetujui: ya`).

### 12.2 Pre-Production Checklist
- [x] **Isolasi Lingkungan:** Tidak ada token Telegram atau URL webhook rahasia yang ter-hardcode di kode sumber.
- [x] **PWA Offline Standalone:** Service worker dan manifest PWA terkonfigurasi mandiri dengan fallback cache.
- [x] **Keamanan Penyimpanan:** Mekanisme corrupt DB backup dan auto-snapshot restore aktif melindungi integritas data LocalStorage.

