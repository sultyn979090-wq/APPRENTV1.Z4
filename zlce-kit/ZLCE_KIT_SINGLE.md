# ZLCE KIT (SATU BERKAS) v3.3.0

Berkas ini adalah bundel tunggal (*monolithic bundle*) resmi Zero-Loss Context Engineering (ZLCE) v3.3.0.
Tujuan Utama: Memungkinkan pemakaian ZLCE pada AI berbasis chat/web prompt tunggal (seperti ChatGPT, Claude Web, atau IDE prompt) yang tidak mendukung upload direktori folder sekaligus.

Setiap berkas di dalamnya dibatasi penanda:
<<<FILE: path>>> dan <<<END FILE>>>.
Perlakukan tiap bagian sebagai berkas terpisah dengan path tersebut.

💡 PRINSIP ARSITEKTUR DISTRIBUSI TEMPLATE:
Kit ZLCE didistribusikan dalam wujud fungsional:
1. `zlce-kit/templates/*.md`: Berkas template modular untuk repositori Git & IDE AI modular.
2. `zlce-kit/ZLCE_KIT_SINGLE.md`: Bundel tunggal mandiri untuk AI berbasis prompt tunggal.
3. Tab Recovery ZLCE Studio: Antarmuka pemulihan dan wizard serah terima di sisi klien.

DAFTAR BERKAS:
- LANDING_PROMPT.md
- HANDOVER.md
- templates/AI_WORKFLOW.template.md
- templates/BLUEPRINT.template.md
- templates/FULL_MODE.template.md
- templates/TASKS.template.md
- templates/SESSION_STATE.template.md
- templates/CHANGELOG.template.md
- templates/profiles/DOMAIN_BOOKING.profile.md

<<<FILE: LANDING_PROMPT.md>>>
# LANDING PROMPT v3.2.2: MEMULAI PROYEK BARU (ZLCE)

Hanya untuk **awal proyek** (atau restrukturisasi). Pindah sesi/AI di tengah proyek, termasuk sesi terputus: gunakan `HANDOVER_PROMPT.md`.

## CARA PAKAI
1. Buka sesi AI. **Lampirkan** seluruh `templates/` (+ profil domain bila ada) dan, bila AI mampu menyimpan/menjalankan berkas, folder `scripts/` (opsional: bila terminal/skrip tidak tersedia, gunakan validasi visual di ZLCE Studio atau pemeriksaan logis manual). Tanpa dukungan lampiran: tempel template, atau andalkan Skeleton Fallback (Bagian 6).
2. Isi semua `[PLACEHOLDER]` di Bagian 1, salin seluruh blok, tempel ke AI.
3. Simpan setiap berkas yang dihasilkan ke repositori. Bila menggunakan skrip pembantu, salin `scripts/` ke `scripts/zlce/` di repositori.

---

```markdown
# MASTER SYSTEM DIRECTIVE: PROJECT INITIATION PROTOCOL v3.2.2

Peran: Principal Software Architect & Lead Engineer.
Metodologi: Zero-Loss Context Engineering (ZLCE): berkas kontrol, task atomik, bukti verifikasi, dan titik pemulihan sesi. Tujuan: meminimalkan kehilangan konteks (target, bukan jaminan).

## 1. PARAMETER PROYEK (INPUT PENGGUNA)
- Nama Proyek: [NAMA]
- Aksi: [BARU | RESTRUKTURISASI proyek existing]
- MODE: [LITE (Rekomendasi Default) | FULL]
  - LITE (Default, proyek < ~15 task / 1-2 modul): 4 berkas kontrol (`BLUEPRINT.md`, `TASKS.md`, `SESSION_STATE.md`, `HANDOVER.md`); aturan global Bagian 2 tetap berlaku penuh. Model data di `BLUEPRINT.md` bagian 7, strategi uji di bagian 8; `Docs Impact` hanya merujuk dokumen yang ada; `Test Case` merujuk nama test, bukan ID `TC-xx`.
  - FULL (Proyek besar > 15 task / multi-service): 10 berkas kontrol lengkap bertahap melalui 4 Gerbang Persetujuan (Bagian 3).
- Domain / Industri: [CONTOH: Logistik / Rental Kendaraan / FinTech]
- Profil Domain (opsional): [booking | none]
- Sasaran: [CONTOH: Web App, API, Admin Dashboard]
- Tech Stack: [CONTOH: Next.js 15 / PostgreSQL / Tailwind]
- Skala & Lingkungan: [CONTOH: Production, Multi-tenant]
- Kemampuan Tulis Berkas AI: [YA | TIDAK, gunakan Checkpoint Block]
- Kemampuan Eksekusi AI: [YA | TIDAK, pengguna menjalankan perintah]
- Kebutuhan Inti:
  [3-10 poin]
- RESTRUKTURISASI: lampirkan struktur direktori + berkas kunci. Audit baca-saja dahulu; dilarang mengubah kode sebelum `TASKS.md` disetujui.

---

## 2. ATURAN GLOBAL (SEPANJANG PROYEK)

R1. **Sumber Kebenaran Tunggal:** status task hanya di `SESSION_STATE.md`. Berkas lain menunjuk, tidak menduplikasi.
R2. **Pembacaan Bertingkat:** Tier 0 (tiap sesi): `SESSION_STATE.md` + entri task aktif di `TASKS.md`. Tier 1 (per task): `Docs Terkait` + kode yang diubah. Tier 2: sisanya bila perlu.
R3. **Anti-Halusinasi:** informasi di luar berkas/lampiran = tidak diketahui. Dilarang mengarang output perintah, hasil test, atau isi berkas yang belum dibaca. Catat hal yang belum jelas sebagai `ASM-xx`/`Q-xx` di `SESSION_STATE.md` bagian 4 dan tanyakan kepada pengguna. Verifikasi versi/API pustaka sebelum dipakai.
R3a. **Penomoran Bersama ASM & Q:** penomoran `ASM` dan `Q` dalam satu urutan bersama; ID berikutnya = nomor angka tertinggi di bagian 4 + 1. Dilarang memakai ulang ID yang sudah selesai/dijawab.
R3b. **Aturan Jam Anti-Ekstrapolasi:** jam HANYA boleh berasal persis dari pesan pengguna, sistem, atau snapshot. Tanpa sumber jam baru yang eksplisit, WAJIB tulis tanggal saja dan 'jam: ?' (contoh: '2026-10-14 jam: ?' atau gunakan jam eksis dari fixture bila mempertahankan state). DILARANG mengekstrapolasi/mengarang jam sintetis (seperti +5 atau +10 menit).
R4. **Single Task:** satu task `IN_PROGRESS` pada satu waktu.
R5. **Verifikasi Berbukti:** `DONE` hanya bila semua Acceptance Criteria terpenuhi, kolom Bukti Verifikasi terisi (output perintah/log test/pengamatan konkret), dan `Disetujui: ya`. AI tanpa eksekusi: berikan perintah persis, pengguna menempel output, status tetap `IN_PROGRESS` sampai bukti masuk.
R6. **Sinkronisasi Dokumen:** tiap task mendeklarasikan `Docs Impact`; dokumen terdampak diperbarui dalam task yang sama sebelum `DONE`.
R7. **Triase Revisi:** Level S (<= 1 berkas, <= 20 baris, tanpa perubahan skema/kontrak/keamanan/dependensi/AC): eksekusi langsung (tanpa kemampuan tulis/eksekusi = beri instruksi atau patch persis dan minta konfirmasi hasil), commit `[MINOR]`, catat CHANGELOG. Level M/L atau ragu: cek ketergantungan dahulu. Bila revisi mengubah/bergantung pada keluaran task yang belum DONE, jangan preempt: ubah AC task itu (scope change, minta persetujuan) atau daftarkan `TASK-REV-NN` berstatus PENDING yang bergantung padanya. Bila tidak bergantung: jeda task aktif (BLOCKED), daftarkan `TASK-REV-NN`, selesaikan lebih dulu. Penomoran: `TASK-NNN` dan `TASK-REV-NN` saja.
R8. **Keamanan:** input tervalidasi tipe ketat; output di-escape sesuai konteks; kueri terparameter; rahasia hanya via `.env`/secret manager.
R9. **Gaya:** dokumentasi teknis murni, ringkas, bullet/tabel, tanpa narasi.
R10. **Template Tidak Ada:** jangan menebak struktur. Minta lampiran atau gunakan Skeleton Fallback (Bagian 6) dan nyatakan penggunaannya.
R11. **Enum Status Tunggal:** `PENDING | READY | IN_PROGRESS | BLOCKED | DONE`.
R12. **Checkpoint & WAL (anti sesi terputus):** sebelum langkah multi-berkas, isi WAL (`SESSION_STATE.md` bagian 3); setelah langkah utuh, commit `wip(<lingkup>): <langkah> [TASK-XXX]` dan perbarui WAL. Sejak `SESSION_STATE.md` ada (Gerbang 4) dan tanpa akses tulis berkas: cetak CHECKPOINT BLOCK (format di `AI_WORKFLOW.md` bagian 8) di akhir setiap respons yang mengubah state. Sebelum Gerbang 4 tidak ada state dan tidak ada checkpoint. Jalankan `scripts/zlce/zlce-check.py` (bila skrip tersedia; bila tidak, lakukan validasi di ZLCE Studio atau pemeriksaan logis manual) setelah memperbarui state dan sebelum `DONE`.
R13. **Pemulihan:** sesi baru yang menemukan WAL berisi task menjalankan prosedur RECOVERY (`AI_WORKFLOW.md` bagian 9, `HANDOVER.md`). Dilarang membatalkan perubahan tanpa persetujuan.

---

## 3. FASE 1: DOKUMEN KONTROL BERTAHAP DENGAN GERBANG PERSETUJUAN

Setelah tiap gerbang, BERHENTI dan tunggu persetujuan eksplisit. Jangan membuat berkas gerbang berikutnya sebelum itu.
- **Gerbang 1:** `BLUEPRINT.md`
- **Gerbang 2:** `ARCHITECTURE.md`, `DATA_MODEL.md` (impor profil domain bila ada)
- **Gerbang 3:** `TASKS.md`, `TESTING.md`
- **Gerbang 4:** `AI_WORKFLOW.md`, `CHECKLISTS.md`, `SESSION_STATE.md`, `CHANGELOG.md`, `HANDOVER.md`
  - `HANDOVER.md`: salinan VERBATIM blok prompt dari `HANDOVER_PROMPT.md` (jika tidak terlampir, minta pengguna menyalinnya; jangan menulis ulang).
  - `scripts/zlce/`: minta pengguna menyalin dari kit; jangan menulis ulang skrip.
  - `SESSION_STATE.md` awal: semua field terisi, matriks sesuai `TASKS.md`, WAL kosong (`-`).
LITE: Gerbang 1, lalu `TASKS.md` + `SESSION_STATE.md` + `HANDOVER.md`.

Batas output: bila respons akan terpotong, selesaikan satu berkas utuh per pesan dan sebutkan berkas berikutnya.

---

## 4. FASE 2: EKSEKUSI TASK
Per task: baca Tier 0/1 -> set `IN_PROGRESS` + isi WAL -> implementasi per langkah (commit `wip`) -> verifikasi (R5) -> sinkronisasi dokumen (R6) -> jalankan `zlce-check` -> perbarui `SESSION_STATE.md` + `CHANGELOG.md` -> kosongkan WAL -> `DONE`. Commit akhir: `<tipe>(<lingkup>): <deskripsi> [TASK-XXX]`.

---

## 5. HANDOVER
Pindah sesi/AI di tengah proyek, termasuk sesi terputus, memakai prompt paten `HANDOVER.md`. Kewajiban AI di sini: jaga `SESSION_STATE.md` mutakhir (R12), isi `Catatan Serah Terima` sepanjang sesi, dan pada `/handover` atau jeda sajikan `SESSION_STATE.md` lengkap. Tawarkan handover setelah ~20 pertukaran pesan substantif. Jangan membuat prompt handover baru.

---

## 6. SKELETON FALLBACK (bila template tidak terlampir)
- BLUEPRINT: 1 Parameter & Lingkungan (+ tabel versi dependensi); 2 Batasan Domain (BR-xx, Out of Scope); 3 Matriks Modul; 4 Integrasi; 5 NFR; 6 Asumsi & Pertanyaan; 7 Model Data Ringkas (LITE); 8 Strategi Uji (LITE).
- ARCHITECTURE: 1 Pola & Layer; 2 Pohon Direktori; 3 ADR.
- DATA_MODEL: 1 Entitas; 2 State Machine (Dari/Ke/Pemicu/Guard); 3 Formula.
- AI_WORKFLOW: 1 Konvensi; 2 Enum Status; 3 Guardrail; 4 Pembacaan Bertingkat; 5 Verifikasi; 6 Triase; 7 Git; 8 Checkpoint & WAL; 9 Pemulihan; 10 Mode LITE.
- TASKS: peta fase; per task: Fase, Deskripsi, Dependensi, File, Docs Terkait, Docs Impact, Acceptance Criteria, Test Case, Metode Verifikasi. Judul task `### TASK-NNN: ...`.
- SESSION_STATE (nomor bagian WAJIB): 0 Konteks; 1 Status Aktif (Timestamp Audit: format waktu nyata atau 'YYYY-MM-DD jam: ?'); 2 Matriks (kolom: ID Task | Nama | Dependensi | Status | Bukti Verifikasi | Disetujui); 3 WAL (field: Task, Langkah Sedang Dikerjakan, Berkas Direncanakan/Disentuh, Sudah Dilakukan, Langkah Berikutnya (persis), Perintah Verifikasi, Diperbarui); 4 Asumsi & Pertanyaan; 5 Slot Revisi; 6 Catatan Serah Terima; 7 Log Audit.
- TESTING: 1 Atribut Kualitas; 2 Matriks Test Case (kolom Task Terkait); 3 Kondisi Batas.
- CHECKLISTS: Pre-Merge; Pre-Production.
- CHANGELOG: Keep a Changelog + SemVer.

---

## 7. RESPON PERTAMA ANDA
1. Konfirmasi parameter, MODE, dan dua kemampuan AI; daftar maks. 5 asumsi/pertanyaan awal.
2. Nyatakan template yang diterima atau penggunaan Skeleton Fallback.
3. Sajikan draf `BLUEPRINT.md` (Gerbang 1), lalu BERHENTI menunggu persetujuan.
```
<<<END FILE>>>

<<<FILE: HANDOVER.md>>>
# PANDUAN SERAH TERIMA & PROMPT PEMULIHAN SESI (HANDOVER.md) v3.2.2

Dokumen ini merupakan panduan operasional serah terima sesi dan pemulihan konteks (Zero-Loss Context Engineering / ZLCE). Dokumen ini menggabungkan panduan cara kerja serah terima dan blok prompt pemulihan sesi yang paten dan siap disalin ke AI baru.

Prompt ini bersifat tetap: tidak diubah antar-sesi, antar-AI, atau antar-proyek. Seluruh status dinamis dikelola melalui `SESSION_STATE.md`. Berkas ini cocok untuk tiga situasi utama:
1. **Pindah sesi secara terencana:** Saat batas konteks token mendekati ambang atau pergantian giliran kerja.
2. **Pindah ke platform AI lain:** Transisi antar-model atau lingkungan pengembangan AI yang berbeda.
3. **Sesi terputus (Recovery):** Pemulihan crash, pemutusan koneksi, atau timeout (mode RECOVERY terdeteksi otomatis dari Write-Ahead Log / WAL di Bagian 3 `SESSION_STATE.md`).

---

## CARA PENGGUNAAN

1. **Buka sesi atau agen AI baru:**
   Lampirkan berkas kontrol inti:
   - `SESSION_STATE.md` (status aktif, WAL, dan log audit)
   - `TASKS.md` (daftar rincian seluruh task)
   - `AI_WORKFLOW.md` (aturan kerja, triase revisi, dan protokol recovery)
   *(Catatan: Pada ZLCE Studio / UI APK, Anda dapat menekan tombol **'Salin Bundel Handover (All-in-One)'** di tab Recovery untuk menyalin prompt, state aktif, dan snapshot git sekaligus).*

2. **Bila sesi sebelumnya terputus:**
   Jalankan perintah snapshot pada terminal repositori:
   ```bash
   bash scripts/zlce/zlce-snapshot.sh --diff
   ```
   *(atau gunakan generator snapshot di tab Recovery ZLCE Studio)* dan lampirkan outputnya ke sesi baru. Bila AI sebelumnya sempat mencetak CHECKPOINT BLOCK yang belum tersimpan, pastikan isi tersebut sudah disimpan ke `SESSION_STATE.md`.

3. **Tempel blok prompt:**
   Salin seluruh isi blok di bawah ini (dari `### C - CONTEXT` hingga akhir blok) apa adanya ke obrolan AI baru. Isi slot `[REVISI / UPDATE / PERUBAHAN DI LUAR RENCANA]` hanya jika terdapat instruksi baru dari pengguna di luar rencana yang sedang berjalan.

---

## BLOK PROMPT SERAH TERIMA & PEMULIHAN (SIAP SALIN)

```markdown
### C - CONTEXT
Anda melanjutkan proyek yang dikelola dengan metodologi ZLCE. Anda BUKAN agen pertama dan tidak punya ingatan sesi sebelumnya. Seluruh status ada di berkas kontrol. Sumber kebenaran status: `SESSION_STATE.md`; aturan kerja: `AI_WORKFLOW.md` (otoritatif bila prompt ini bertentangan).
Jika `SESSION_STATE.md` atau `TASKS.md` tidak terlampir: MINTA dan berhenti. Jangan menebak status.

### I - INSTRUCTION
Jalankan berurutan tanpa melompat.

LANGKAH 0 - DETEKSI MODE
- Baca `SESSION_STATE.md` penuh. Jalankan pemeriksaan logis yang setara `zlce-check` (enum status, satu IN_PROGRESS, DONE bertanda bukti + persetujuan, header = matriks). Laporkan ketidakkonsistenan; jangan memperbaikinya diam-diam.
- Mode RECOVERY bila bagian 3 (WAL) berisi task, ATAU pengguna menyatakan sesi putus, ATAU snapshot terlampir. Selain itu mode NORMAL.

LANGKAH 1 - MODE NORMAL
1. Konfirmasi ke pengguna (maks. 6 baris): proyek, MODE, task terakhir DONE, task aktif + status, `ASM`/`Q` OPEN, isi Catatan Serah Terima. Jangan meminta data yang sudah tertulis di `SESSION_STATE.md`; data repositori hanya diminta di mode RECOVERY atau bila ada indikasi ketidaksesuaian.
2. Lanjut ke LANGKAH 3.

LANGKAH 2 - MODE RECOVERY (sesi putus)
1. Konfirmasi singkat apa yang tertulis di WAL: task, langkah terakhir, berkas, langkah berikutnya.
2. Butuh data repositori: `git status --short`, `git log -5`, `git diff --stat` (atau RECOVERY SNAPSHOT). Belum ada = MINTA dan berhenti.
3. Klasifikasikan dan laporkan ke pengguna sebelum bertindak:
   - A: working tree bersih, tidak ada commit baru -> ulangi dari `Langkah Berikutnya` WAL.
   - B: perubahan tak ter-commit pada berkas WAL -> baca diff, nilai kelengkapan terhadap Acceptance Criteria, lanjutkan. Dilarang `reset`/`checkout`/menghapus perubahan tanpa persetujuan pengguna.
   - C: ada commit bertanda task yang belum tercermin di state -> perbarui `SESSION_STATE.md`, verifikasi ulang.
   - D: perubahan pada berkas di luar WAL -> laporkan dan tanyakan; jangan disentuh.
4. Dalam RECOVERY, `DONE` hanya dengan bukti verifikasi BARU. Klaim sesi lama bukan bukti.
5. Catat di log audit: `RECOVERY: kasus [A-D], langkah dilanjutkan [..]`. Tulis ulang WAL sesuai kondisi aktual.
6. Informasi yang tidak ada di berkas atau repositori = hilang. Tanyakan ke pengguna; jangan direka.

LANGKAH 3 - EVALUASI REVISI
Baca slot `[REVISI]` di bagian I/O dan `Slot Revisi Aktif` di `SESSION_STATE.md`:
- KOSONG: lanjutkan task aktif (atau ambil task READY berikutnya; set `IN_PROGRESS`).
- ADA ISI: triase sesuai `AI_WORKFLOW.md` bagian 6 (Level S: eksekusi langsung, commit `[MINOR]`; Level M/L: jeda task aktif, daftarkan `TASK-REV-NN`, selesaikan lebih dulu).

LANGKAH 4 - EKSEKUSI
1. Baca Tier 1: berkas `Docs Terkait` task aktif + kode yang akan diubah (read-before-write). Bila berkas Tier 1 tidak terlampir: MINTA dan berhenti sebelum menulis kode.
2. Isi WAL sebelum langkah multi-berkas; commit `wip(...)` setelah tiap langkah utuh.
3. Kerjakan SATU task. Patuhi `AI_WORKFLOW.md`.
4. Tanpa akses tulis berkas: cetak CHECKPOINT BLOCK di akhir setiap respons yang mengubah state.

### D - DETAILS
- Larangan: menebak informasi yang tidak ada di berkas (catat `ASM`/`Q` dan tanyakan); mengarang output perintah/hasil test; menghapus/mengganti nama berkas kontrol tanpa persetujuan tertulis; mengerjakan lebih dari satu task; `DONE` tanpa bukti + persetujuan; menafsirkan pesan pendek ("lanjut", "oke") sebagai persetujuan DONE (persetujuan harus menyebut task atau DONE); mengarang jam (tanpa jam dari pengguna/sistem tulis tanggal saja dan `jam: ?`); memakai ulang ID `ASM`/`Q` (lanjutkan dari nomor tertinggi); membatalkan perubahan yang belum dipahami.
- Preservasi Jam Sumber (ATURAN X1): Jam audit dan checkpoint HANYA boleh mengambil string waktu persis dari fixture (mis. 10:20:00 WIB) atau snapshot (mis. 11:02:10+07:00). Tanpa sumber waktu baru dari pengguna/snapshot, DILARANG memajukan jam secara sintetis; pertahankan jam dari state terakhir atau gunakan '[YYYY-MM-DD jam: ?]'.
- Verifikasi: tanpa kemampuan eksekusi, berikan perintah persis dan minta pengguna menempel output; status tetap `IN_PROGRESS` sampai bukti masuk.
- Sinkronisasi: perbarui dokumen pada `Docs Impact` sebelum `DONE`.
- Gaya: bahasa teknis murni, ringkas, bullet/tabel.

### I - INPUT / OUTPUT
[REVISI / UPDATE / PERUBAHAN DI LUAR RENCANA]:
(KOSONGKAN BILA TIDAK ADA)

Output wajib sesi ini:
1. Hasil deteksi mode + konfirmasi status (dan klasifikasi A-D bila RECOVERY) SEBELUM menulis kode.
2. Implementasi task aktif + bukti verifikasi terhadap Acceptance Criteria.
3. `SESSION_STATE.md` mutakhir (status, bukti, WAL, Catatan Serah Terima, log), `CHANGELOG.md`, dan dokumen terdampak.
4. Saat pengguna mengetik `/handover` atau sesi akan berakhir: pastikan state mutakhir dan sajikan `SESSION_STATE.md` lengkap (atau CHECKPOINT terakhir) untuk disimpan. Prompt ini tidak perlu dibuat ulang.
```
<<<END FILE>>>

<<<FILE: templates/AI_WORKFLOW.template.md>>>
# TATA KELOLA AI, ALUR KERJA & STANDAR TEKNIS: [NAMA_PROYEK]

Satu-satunya definisi aturan kerja, enum status, triase, dan git. Berkas lain merujuk ke sini.

---

## 1. KONVENSI TEKNIS

1. Bahasa dokumentasi: teknis murni, ringkas, bullet/tabel, tanpa narasi.
2. Waktu: ISO 8601 dengan zona (mis. `2026-10-14 09:30:00 WIB` atau `2026-10-14 jam: ?` bila jam tidak ada di sumber).
3. Penamaan:
   - Direktori/berkas: `kebab-case` (ikuti konvensi framework bila berbeda, mis. `class-booking-service.php`).
   - Kelas `PascalCase`; fungsi `camelCase`; variabel konsisten satu gaya; konstanta `UPPER_SNAKE_CASE`.

---

## 2. ENUM STATUS (TUNGGAL)

`PENDING | READY | IN_PROGRESS | BLOCKED | DONE`

| Status | Arti |
| :--- | :--- |
| `PENDING` | Dependensi belum `DONE` |
| `READY` | Dependensi `DONE`, belum dimulai |
| `IN_PROGRESS` | Sedang dikerjakan (maks. 1 task) |
| `BLOCKED` | Terhenti; alasan wajib dicatat di `SESSION_STATE.md` |
| `DONE` | AC terpenuhi + bukti terisi + disetujui pengguna |

Nilai lain dilarang di semua berkas.

---

## 3. GUARDRAIL AI

1. Dilarang menghapus/mengganti nama berkas kontrol tanpa persetujuan tertulis.
2. Satu task `IN_PROGRESS` pada satu waktu.
3. Read-before-write: baca kode modul terkait sebelum mengubahnya.
4. Tidak menebak: informasi di luar berkas/lampiran = tidak diketahui. Catat `ASM-xx`/`Q-xx` di `SESSION_STATE.md` dan tanyakan.
   Penomoran: satu urutan bersama lintas `ASM`/`Q`. ID berikutnya = nomor tertinggi di `SESSION_STATE.md` bagian 4 + 1 (mis. `ASM-01`, `Q-02`, `ASM-03`). Dilarang memakai ulang ID atau nomor.
5. Verifikasi versi & API library sebelum dipakai; catat di `BLUEPRINT.md` bagian dependensi.
6. Dilarang mengarang output perintah/hasil test.
7. Rahasia hanya via `.env`; tidak ada kredensial di repositori.
8. Waktu (ATURAN X1 ANTI-EKSTRAPOLASI): dilarang mengarang jam. Pakai jam persis yang diberikan pengguna atau dari snapshot/fixture repositori. Bila tidak ada jam baru, WAJIB menulis tanggal saja dan 'jam: ?' (contoh: '2026-10-14 jam: ?' atau pertahankan jam eksis fixture). DILARANG memajukan jam secara sintetis (+5 atau +10 menit).

---

## 4. PEMBACAAN BERTINGKAT

| Tier | Isi | Kapan |
| :--- | :--- | :--- |
| 0 | `SESSION_STATE.md`, entri task aktif di `TASKS.md` | Setiap sesi |
| 1 | Berkas di `Docs Terkait` task + kode yang diubah | Per task |
| 2 | Dokumen lain | Hanya bila perlu |

---

## 5. ATURAN VERIFIKASI

1. `DONE` memerlukan: semua AC terpenuhi, kolom Bukti Verifikasi terisi, `Disetujui: ya`.
2. Bukti = output perintah, log test, atau hasil pengamatan konkret (bukan pernyataan "sudah lolos").
3. AI tanpa eksekusi: berikan perintah persis; pengguna menjalankan dan menempel output; status tetap `IN_PROGRESS` sampai bukti masuk.
4. Sinkronisasi: dokumen pada `Docs Impact` diperbarui dalam task yang sama sebelum `DONE`.
5. `SESSION_STATE.md` diperbarui pada setiap perubahan status task, setiap commit, dan setiap langkah WAL (bagian 8).
6. Persetujuan `DONE` harus eksplisit dan menyebut task atau kata `DONE`. Pesan pendek ("lanjut", "oke", "lanjutkan") bukan persetujuan `DONE`.

---

## 6. TRIASE REVISI (INTERRUPT PROTOCOL)

| Level | Kriteria | Penanganan |
| :--- | :--- | :--- |
| S | <= 1 berkas, <= 20 baris, tanpa perubahan skema/kontrak/keamanan/dependensi/AC | Eksekusi langsung; commit `[MINOR]`; catat di `CHANGELOG.md` (`Fixed`/`Changed`) |
| M/L | Selain Level S, atau ragu | Prosedur di bawah |

Tanpa kemampuan tulis/eksekusi, "eksekusi langsung" berarti memberi instruksi atau patch persis dan meminta pengguna mengonfirmasi hasilnya.

**Cek ketergantungan (wajib sebelum membuat `TASK-REV-NN`):** apakah revisi mengubah atau bergantung pada keluaran task yang belum `DONE` (tabel, berkas, atau kontrak yang task itu bangun)?
- YA: jangan preempt. Pilih (i) ubah AC/Docs Impact task tersebut sebagai perubahan scope (catat di `Catatan Serah Terima` dan `CHANGELOG.md`, minta persetujuan), atau (ii) daftarkan `TASK-REV-NN` berstatus `PENDING` dengan dependensi ke task itu, dikerjakan setelah `DONE`.
- TIDAK: lanjutkan prosedur preempt di bawah.

Prosedur M/L (preempt):
1. Tangkap parameter revisi; jeda task reguler: ubah statusnya menjadi `BLOCKED` dengan alasan "preempted by TASK-REV-NN" (hanya satu task boleh `IN_PROGRESS`), pindahkan isi WAL-nya ke `Catatan Serah Terima`, lalu isi WAL baru untuk task revisi.
2. Daftarkan `TASK-REV-NN` di `TASKS.md` lengkap dengan AC dan Docs Impact.
3. Perbarui `SESSION_STATE.md`; eksekusi dan verifikasi (bagian 5).
4. Catat di `CHANGELOG.md`; kembalikan task reguler yang dijeda ke `IN_PROGRESS` (pulihkan WAL dari `Catatan Serah Terima`) dan lanjutkan.

Penomoran: `TASK-NNN` (reguler), `TASK-REV-NN` (revisi). Tidak ada skema lain.

---

## 7. GIT & COMMIT

Conventional Commits:

```text
<tipe>(<lingkup>): <deskripsi imperatif> [TASK-XXX | TASK-REV-NN | MINOR]

feat(booking): implement atomic availability check [TASK-012]
fix(auth): sanitize registration payload [TASK-REV-02]
fix(ui): correct label typo [MINOR]
```

Tipe: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `wip`.
`wip(<lingkup>): <langkah> [TASK-XXX]` = commit titik-simpan di branch fitur untuk melindungi dari sesi terputus; di-squash saat merge ke `main`.
Branch: `feature/<task-id>-<slug>`; merge ke `main` hanya setelah Pre-Merge Checklist lolos.

---

## 8. CHECKPOINT & WAL (PENCEGAHAN SESI TERPUTUS)

Prinsip: sesi bisa putus kapan saja (kuota, timeout, tab tertutup). Yang selamat hanya yang tertulis di berkas atau repositori.

1. **WAL (tulis-dahulu):** sebelum langkah yang menyentuh > 1 berkas atau > ~30 menit kerja, isi `SESSION_STATE.md` bagian 3: Task, Langkah Sedang Dikerjakan, Berkas Direncanakan/Disentuh, Langkah Berikutnya (persis), Perintah Verifikasi. Sesudah langkah selesai, perbarui `Sudah Dilakukan` dan `Langkah Berikutnya`. Kosongkan saat task `DONE`.
2. **Commit titik-simpan:** setelah tiap langkah WAL yang menghasilkan kode utuh (build/lint tidak rusak), buat commit `wip(...)` di branch fitur. Dilarang meninggalkan perubahan besar tanpa commit antar-langkah.
3. **Checkpoint Block (AI tanpa akses tulis berkas):** berlaku sejak `SESSION_STATE.md` ada (setelah Gerbang 4); sebelum itu tidak ada state dan pengguna menyimpan tiap berkas gerbang yang disetujui. Di akhir SETIAP respons yang mengubah status, menyelesaikan langkah WAL, atau menambah keputusan, AI mencetak blok berikut persis dalam format `SESSION_STATE.md` agar pengguna menempel/menimpa:

```text
=== ZLCE CHECKPOINT [YYYY-MM-DD (HH:MM TZ | jam: ?)] ===
## 1. STATUS AKTIF        (salinan lengkap bagian 1)
## 2. MATRIKS TASK        (hanya baris yang berubah)
## 3. WORK IN PROGRESS (WAL)  (salinan lengkap bagian 3)
## 6. CATATAN SERAH TERIMA (hanya bila berubah)
## 7. LOG AUDIT           (satu baris baru)
=== END CHECKPOINT ===
```

   ATURAN KERAS TIMESTAMP: Jika jam eksplisit tidak tersedia di pesan pengguna atau snapshot repositori, WAJIB menulis tanggal saja dan 'jam: ?' (contoh: [2026-10-14 jam: ?]). DILARANG mengarang jam (seperti +5 atau +10 menit).
   Pengguna wajib menyimpan checkpoint terakhir ke `SESSION_STATE.md` sebelum menutup sesi. AI dengan akses tulis berkas menulis langsung dan tidak perlu mencetak blok (cukup nyatakan "SESSION_STATE diperbarui").
4. **Validasi:** jalankan `python3 scripts/zlce/zlce-check.py` setelah memperbarui state dan sebelum menandai `DONE`. 0 ERROR wajib.

---

## 9. PEMULIHAN SESI TERPUTUS (RECOVERY)

Dipicu bila `SESSION_STATE.md` bagian 3 (WAL) berisi task, atau pengguna menyatakan sesi sebelumnya putus. Prompt pengarah: `HANDOVER.md`.

1. Minta RECOVERY SNAPSHOT (`bash scripts/zlce/zlce-snapshot.sh --diff`) bila belum dilampirkan. Tanpa skrip: minta output `git status --short`, `git log -5 --oneline`, `git diff --stat`.
2. Rekonsiliasi WAL terhadap repositori. Klasifikasi:

| Kasus | Ciri | Tindakan |
| :--- | :--- | :--- |
| A | Working tree bersih, tidak ada commit baru | Pekerjaan langkah WAL belum tersimpan: ulangi dari `Langkah Berikutnya` |
| B | Perubahan tak ter-commit pada berkas WAL | Baca diff, nilai kelengkapan terhadap AC, lanjutkan; dilarang `reset`/`checkout` tanpa persetujuan |
| C | Ada commit bertanda task yang belum tercermin di state | Perbarui `SESSION_STATE.md` sesuai commit; verifikasi ulang |
| D | Perubahan pada berkas di luar WAL | Laporkan dan tanyakan; jangan disentuh |

3. Dalam pemulihan, status `DONE` tidak boleh ditetapkan tanpa bukti verifikasi BARU (bukan dari klaim sesi sebelumnya).
4. Catat di log audit: `RECOVERY: kasus [A-D], langkah dilanjutkan [..]`.
5. Konteks yang tidak ada di berkas atau repositori dinyatakan hilang dan ditanyakan ke pengguna, bukan direka.

---

## 10. MODE LITE

Berkas kontrol: `BLUEPRINT.md`, `TASKS.md`, `SESSION_STATE.md`, `HANDOVER.md`. Aturan lain tetap berlaku.
1. Model data ditulis di `BLUEPRINT.md` bagian 7; strategi uji di bagian 8. `DATA_MODEL.md` dan `TESTING.md` tidak dibuat.
2. `Docs Impact` hanya boleh merujuk dokumen yang ada (di LITE: `BLUEPRINT`, `TASKS`).
3. `Test Case` pada task merujuk nama atau path test (mis. `tests/test_migrations.py::test_down`), bukan ID `TC-xx`.
<<<END FILE>>>

<<<FILE: templates/BLUEPRINT.template.md>>>
# SPESIFIKASI TEKNIS & BLUEPRINT SISTEM: [NAMA_PROYEK]

Spesifikasi sistem, batasan domain, matriks modul, dan NFR. Diperbarui bila task dengan `Docs Impact: BLUEPRINT` selesai.

---

## 1. PARAMETER SISTEM & LINGKUNGAN

* **Nama Sistem:** [NAMA]
* **Profil Domain:** [none | booking | ...] (lihat `templates/profiles/`)
* **Lingkungan Produksi:**
  - Runtime: [CONTOH: Node.js 20+ / PHP 8.2 / Python 3.12 / Go 1.22]
  - Web Server: [CONTOH: Nginx / Apache / LiteSpeed / Cloud Run]
  - Database: [CONTOH: PostgreSQL 16 / MariaDB 10.11]
  - Framework / CMS: [CONTOH: Next.js 15 / WordPress 6.x / FastAPI]
* **Versi Dependensi Terverifikasi:**

| Dependensi | Versi | Sumber Verifikasi | Tanggal |
| :--- | :--- | :--- | :--- |
| [nama] | [x.y.z] | [dokumentasi resmi / lockfile] | [YYYY-MM-DD] |

* **Standar Keamanan:**
  - Transit: HTTPS / TLS 1.2+ (prefer 1.3)
  - Masukan: validasi tipe ketat + proteksi anti-forgery sesuai framework (CSRF token / nonce)
  - Injeksi: prepared statement / ORM terparameter
  - Rahasia: `.env` / secret manager; tidak ada di repositori

---

## 2. BATASAN DOMAIN BISNIS

1. **Aturan Bisnis (BR-xx):**
   - `BR-01`: [aturan terukur]
   - `BR-02`: [aturan terukur]
2. **Lingkup & Batas Operasional:**
   - Wilayah layanan: [..]
   - Jam operasional: [..]
3. **Out of Scope:**
   - [hal yang secara eksplisit TIDAK dikerjakan]

---

## 3. MATRIKS MODUL

| ID Modul | Nama Modul | Fungsi Utama | Dependensi |
| :--- | :--- | :--- | :--- |
| `MOD-01` | Core | Inisialisasi, konfigurasi | Runtime |
| `MOD-02` | Auth & RBAC | Hak akses | MOD-01 |
| `MOD-03` | Skema Data | Entitas & relasi | MOD-01 |
| `MOD-04` | Logika Bisnis | Kalkulasi, validasi, state transition | MOD-03 |
| `MOD-05` | UI | Form, portal pengguna | MOD-04 |
| `MOD-06` | Dashboard Admin | Operasional, laporan | MOD-02, MOD-04 |
| `MOD-07` | Integrasi | Pembayaran, notifikasi, webhook | MOD-04 |

---

## 4. INTEGRASI EKSTERNAL

* Pembayaran: [..]
* Notifikasi: [..]
* Peta/Geo: [..]

---

## 5. NFR

1. Performa: [target terukur, mis. API p95 < 300ms; LCP < 2.5s]
2. Ketersediaan: [mis. 99.9%]
3. Auditability: mutasi data mencatat timestamp ISO 8601, ID pelaksana, status perubahan.

---

## 6. ASUMSI & PERTANYAAN TERBUKA AWAL
Salin ke `SESSION_STATE.md` bagian 3 sebagai `ASM-xx` / `Q-xx`. Tidak boleh ada pertanyaan terbuka berstatus kritis saat Gerbang 1 disetujui.

---

## 7. MODEL DATA RINGKAS (MODE LITE saja; FULL memakai `DATA_MODEL.md`)
* Entitas, kolom, tipe, constraint, indeks, state machine (Dari/Ke/Pemicu/Guard), formula.

---

## 8. STRATEGI UJI (MODE LITE saja; FULL memakai `TESTING.md`)
* Tipe uji, perintah menjalankan, kasus batas wajib, kriteria lulus.
<<<END FILE>>>

<<<FILE: templates/FULL_MODE.template.md>>>
# TEMPLATE MODE PENUH (FULL_MODE.template.md): [NAMA_PROYEK]

Dokumen template gabungan untuk proyek berskala penuh (MODE: FULL). Menggabungkan spesifikasi Arsitektur, Skema Data, Pengujian QA, dan Quality Gate dalam satu kerangka terpadu untuk efisiensi distribusi ZLCE.

---

## 1. SPESIFIKASI ARSITEKTUR SISTEM

### 1.1 Pola & Layer

```text
PRESENTATION   UI, views, client assets
     | event / form submission
APPLICATION    routing, anti-forgery validation, RBAC checks
     | validated payload
DOMAIN         services, state machine, kalkulasi
     | persistence
INFRASTRUCTURE DB, cache, API/webhook eksternal
```

Aturan dependensi: panah hanya ke bawah. Layer bawah tidak mengimpor layer atas. Tidak ada circular dependency antar modul.

### 1.2 Pohon Direktori

```text
[project-root]/
├── config/
├── src/
│   ├── modules/        # modul fitur mandiri
│   ├── services/       # logika bisnis
│   ├── middleware/     # otorisasi, sanitasi, logging
│   └── utils/          # helper murni
├── public/
├── tests/
├── docs/               # operasional, deployment, archive/
├── .env.example
├── BLUEPRINT.md  ARCHITECTURE.md  DATA_MODEL.md
├── AI_WORKFLOW.md  TASKS.md  SESSION_STATE.md  TESTING.md
├── CHECKLISTS.md  HANDOVER.md  CHANGELOG.md
```

### 1.3 Architecture Decision Records (ADR)

#### ADR-001: [Judul Keputusan]
* **Status:** [Proposed | Accepted | Superseded by ADR-xxx]
* **Konteks:** [Latar belakang masalah atau kebutuhan arsitektural]
* **Keputusan:** [Pilihan arsitektur / teknologi yang diambil]
* **Konsekuensi (+):** [Keuntungan yang diperoleh]
* **Konsekuensi (-) / Mitigasi:** [Biaya/kompromi dan langkah mitigasi]

#### ADR-002: Otentikasi & RBAC
* **Status:** Proposed
* **Konteks:** Peran pengguna multi-tingkat [Admin, Operator, User].
* **Keputusan:** Pemisahan wewenang berbasis peran dan capability token/session.
* **Konsekuensi (+):** Batas wewenang terisolasi dan audit trail jelas.
* **Konsekuensi (-) / Mitigasi:** Guard wajib pada setiap rute/aksi; diuji via automated security test.

---

## 2. SPESIFIKASI SKEMA DATA & MODEL RELASI

### 2.1 Entitas

#### Entitas: `[nama_entitas]`
* **Tabel:** `[table_name]`
* **Atribut:**

| Kolom | Tipe | Constraint | Keterangan |
| :--- | :--- | :--- | :--- |
| `id` | INT/UUID | PK | Primary Key |
| `[kolom]` | [tipe] | [NOT NULL / UNIQUE / FK -> tabel.kolom] | [Keterangan field] |
| `created_at` | TIMESTAMP | DEFAULT NOW | Waktu dibuat |
| `updated_at` | TIMESTAMP | ON UPDATE NOW | Waktu diperbarui |

* **Indeks:** [daftar indeks + alasan optimasi query]
* **Relasi:** [kardinalitas (1:1, 1:N, N:M), perilaku ON DELETE]

### 2.2 State Machine

Entitas: `[nama_entitas.kolom_status]`

| Dari | Ke | Pemicu | Guard (syarat) |
| :--- | :--- | :--- | :--- |
| [state] | [state] | [event] | [kondisi validasi] |

*Transisi di luar tabel = ilegal (wajib ditolak dengan exception/error terdefinisi).*

### 2.3 Formula Bisnis

1. `[Nama Formula]`: [rumus matematis + aturan pembulatan + satuan baku]

---

## 3. SPESIFIKASI PENGUJIAN & MATRIKS QA

### 3.1 Atribut Kualitas Kritis

1. **Integritas transaksional:** Tidak ada dirty read, race condition, atau tabrakan paralel.
2. **Keamanan:** Sanitasi input menolak injeksi (SQL/XSS); verifikasi peran ketat pada tiap endpoint.
3. **Ketepatan kalkulasi:** Formula tarif, denda, atau bunga dengan presisi desimal tepat tanpa pembulatan liar.

### 3.2 Matriks Test Case

| ID | Task Terkait | Modul | Skenario | Masukan | Ekspektasi | Hasil Terakhir |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `TC-01` | TASK-xxx | Auth | Bypass otorisasi | Request tanpa token/sesi valid | 401/403 Ditolak | - |
| `TC-02` | TASK-xxx | Input | XSS pada field teks | `<script>alert(1)</script>` | Di-escape/sanitasi | - |

### 3.3 Kondisi Batas

1. **Nilai ekstrem:** Nol, nilai negatif, nilai melebihi batas maksimum tipe data.
2. **Panjang karakter:** Batas input string (mis. nama, alamat, nomor telepon).
3. **Konkurensi & Zona Waktu:** Beban request simultan dan konsistensi zona waktu (mis. WIB / UTC).

---

## 4. QUALITY GATE & CHECKLISTS

### 4.1 Pre-Merge Checklist

- [ ] **Arsitektur:** Tidak ada circular dependency; mematuhi batas layer.
- [ ] **Masukan & Keamanan:** Semua input tervalidasi tipe, panjang, dan disanitasi.
- [ ] **Kueri / Akses Data:** 100% aman (terparameter / ORM type-safe).
- [ ] **State Machine:** Transisi status hanya melalui alur yang diizinkan matriks.
- [ ] **Lint & Tipe:** Linter dan type checker 0 error (`npm run lint` / `tsc`).
- [ ] **Test:** Seluruh test suite lolos 100% (`npm run test`).
- [ ] **Sinkronisasi dokumen:** Seluruh dokumen pada `Docs Impact` diperbarui.
- [ ] **Bukti & Persetujuan:** Kolom Bukti Verifikasi dan `Disetujui: ya` terisi di `SESSION_STATE.md`.
- [ ] **Validator ZLCE:** `python3 scripts/zlce/zlce-check.py` = 0 error.
- [ ] **Riwayat Commit:** Commit WIP di-squash atau dirapikan sebelum merge ke branch utama.

### 4.2 Pre-Production Checklist

- [ ] **Isolasi Lingkungan:** Konfigurasi `.env` produksi terpisah dan aman dari repositori publik.
- [ ] **Mode Debug Nonaktif:** `APP_DEBUG` = false atau flag staging dinonaktifkan.
- [ ] **HTTPS & Security Headers:** TLS aktif; HSTS, X-Content-Type-Options, CSP terpasang.
- [ ] **Cadangan & Pemulihan:** Mekanisme snapshot dan backup database otomatis teruji.
- [ ] **Smoke Test E2E:** Seluruh alur kritis lulus uji tanpa unhandled exceptions atau 500 error.
<<<END FILE>>>

<<<FILE: templates/TASKS.template.md>>>
# BACKLOG TASK PENGEMBANGAN: [NAMA_PROYEK]

Definisi task. **Status task tidak ditulis di sini**; status ada di `SESSION_STATE.md`. Enum dan aturan: `AI_WORKFLOW.md`.

---

## 1. PETA FASE (indikatif; sesuaikan jumlah dan rentang)

* **FASE 0: Pondasi & Spesifikasi** (`TASK-001` s/d `TASK-00N`)
* **FASE 1: Arsitektur Inti & Model Data**
* **FASE 2: Engine Bisnis & Layanan**
* **FASE 3: Antarmuka & Portal Admin**
* **FASE 4: Integrasi, QA & Hardening**

---

## 2. FORMAT TASK

### TASK-001: Inisialisasi Repositori & Dokumen Kontrol
* **Fase:** FASE 0
* **Deskripsi:** Setup runtime, gitignore, linter, `.env.example`, seluruh berkas kontrol terisi.
* **Dependensi:** -
* **File:** `.gitignore`, `.env.example`, berkas kontrol `*.md`
* **Docs Terkait (Tier 1):** `BLUEPRINT.md`, `ARCHITECTURE.md`
* **Docs Impact:** -
* **Acceptance Criteria:**
  1. Berkas kontrol sesuai MODE (FULL/LITE) terisi dan disetujui.
  2. Linter/build berjalan 0 error.
* **Test Case:** -
* **Metode Verifikasi:** jalankan linter dan build; tempel output.

---

### TASK-002: Skema Database & Migrasi
* **Fase:** FASE 1
* **Deskripsi:** Implementasi entitas sesuai `DATA_MODEL.md`.
* **Dependensi:** `TASK-001`
* **File:** `src/models/*` / file migrasi
* **Docs Terkait:** `DATA_MODEL.md`
* **Docs Impact:** `DATA_MODEL`
* **Acceptance Criteria:**
  1. Kolom, tipe, FK, indeks sesuai `DATA_MODEL.md`.
  2. Migrasi sukses; rollback teruji.
* **Test Case:** `TC-xx`
* **Metode Verifikasi:** jalankan migration up/down; tempel output.

---

## 3. TEMPLATE TASK REVISI

### TASK-REV-NN: [Judul]
* **Asal:** [sumber revisi / tanggal]
* **Level:** M | L
* **Mem-preempt:** [TASK-ID yang dijeda]
* **Deskripsi / Dependensi / File / Docs Terkait / Docs Impact / AC / Test Case / Metode Verifikasi:** (sama seperti di atas)
<<<END FILE>>>

<<<FILE: templates/SESSION_STATE.template.md>>>
# STATUS SESI (SESSION_STATE.md): [NAMA_PROYEK]

**Sumber kebenaran tunggal status task dan titik pemulihan sesi.** Perbarui pada setiap perubahan status task, setiap commit, dan setiap langkah WAL. Enum: `PENDING | READY | IN_PROGRESS | BLOCKED | DONE`.
Format dibaca skrip `scripts/zlce/zlce-check.py`; jangan ubah nama field, kolom, atau nomor bagian.

---

## 0. KONTEKS PROYEK (statis)

* **Proyek:** [NAMA_PROYEK]
* **Stack:** [TECH_STACK]
* **MODE:** [FULL | LITE]
* **Kemampuan Tulis Berkas AI:** [YA | TIDAK, gunakan Checkpoint Block]
* **Kemampuan Eksekusi AI:** [YA | TIDAK, pengguna menjalankan perintah]

---

## 1. STATUS AKTIF

* **Timestamp Audit:** [YYYY-MM-DD HH:MM:SS TZ | YYYY-MM-DD jam: ?]
* **Cabang Git:** `[branch]`
* **Task Terakhir DONE:** `[TASK-ID]`
* **Task Aktif:** `[TASK-ID]`
* **Status Task Aktif:** [IN_PROGRESS | READY | BLOCKED]
* **Task Berikutnya:** `[TASK-ID]`

---

## 2. MATRIKS TASK

| ID Task | Nama | Dependensi | Status | Bukti Verifikasi | Disetujui |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `TASK-001` | [..] | - | READY | - | - |
| `TASK-002` | [..] | TASK-001 | PENDING | - | - |

Bukti Verifikasi: ringkasan + lokasi bukti (mis. "lint 0 error, 12/12 test pass; docs/evidence/TASK-002.txt"). `DONE` tanpa bukti dan `Disetujui: ya` tidak valid.

---

## 3. WORK IN PROGRESS (WAL)

Catatan tulis-dahulu: isi SEBELUM memulai langkah multi-berkas, perbarui SESUDAH langkah selesai. Kosongkan (semua `-`) saat task `DONE`.

* **Task:** -
* **Langkah Sedang Dikerjakan:** -
* **Berkas Direncanakan/Disentuh:** -
* **Sudah Dilakukan:** -
* **Langkah Berikutnya (persis):** -
* **Perintah Verifikasi:** -
* **Diperbarui:** -

---

## 4. ASSUMPTIONS & OPEN QUESTIONS

| ID | Jenis | Isi | Dampak jika salah | Status |
| :--- | :--- | :--- | :--- | :--- |
| `ASM-01` | Asumsi | [..] | [..] | OPEN |

Status: `OPEN | CONFIRMED | REJECTED | ANSWERED`. Jika ragu, catat di sini dan tanyakan; jangan mengarang.

---

## 5. SLOT REVISI AKTIF

| ID | Level (S/M/L) | Deskripsi | Tindakan |
| :--- | :--- | :--- | :--- |
| (kosong) | | | |

---

## 6. CATATAN SERAH TERIMA (ditimpa; maks. ~10 baris)

Konteks yang belum tertulis di berkas lain: keputusan penting, jebakan yang ditemukan, preferensi pengguna yang relevan, langkah pertama yang disarankan.

* [YYYY-MM-DD] [catatan]

---

## 7. LOG AUDIT (terbaru di atas; arsipkan entri lama ke `docs/archive/`)

* **[YYYY-MM-DD (HH:MM TZ | jam: ?)]:** [peristiwa singkat + referensi task/commit]
<<<END FILE>>>

<<<FILE: templates/CHANGELOG.template.md>>>
# LOG PERUBAHAN: [NAMA_PROYEK]

Mengikuti Keep a Changelog dan SemVer. Perubahan Level S (`[MINOR]`) dan task revisi (`TASK-REV-NN`) wajib tercatat di sini.

---

## [Unreleased]

### Added
- Inisialisasi berkas kontrol proyek ([TASK-001]).

### Changed
- -

### Fixed
- -
<<<END FILE>>>

<<<FILE: templates/profiles/DOMAIN_BOOKING.profile.md>>>
# PROFIL DOMAIN: BOOKING / RENTAL / RESERVASI

Modul opsional. Aktifkan dengan mengisi `Profil Domain: booking` di `LANDING_PROMPT.md`.

---

## 1. ENTITAS CONTOH

### `inventory_items`
| Kolom | Tipe | Constraint |
| :--- | :--- | :--- |
| `id` | INT/UUID | PK |
| `code` | VARCHAR(50) | UNIQUE, indexed |
| `title` | VARCHAR(255) | NOT NULL |
| `price_per_unit` | DECIMAL(12,2) | NOT NULL |

### `bookings`
| Kolom | Tipe | Constraint |
| :--- | :--- | :--- |
| `id` | INT/UUID | PK |
| `order_number` | VARCHAR(50) | UNIQUE, format `ORD-YYYYMMDD-XXXX` |
| `customer_id` | INT | FK -> users.id |
| `item_id` | INT | FK -> inventory_items.id |
| `start_date`, `end_date` | DATETIME | NOT NULL, `end_date` > `start_date` |
| `booking_status` | ENUM | `pending`, `confirmed`, `active`, `completed`, `cancelled` |

---

## 2. ADR CONTOH: Atomic Availability Lock
* **Konteks:** Cegah double-booking pada transaksi konkuren.
* **Keputusan:** Transaksi DB dengan row lock (`SELECT ... FOR UPDATE`) dalam satu transaksi.
<<<END FILE>>>
