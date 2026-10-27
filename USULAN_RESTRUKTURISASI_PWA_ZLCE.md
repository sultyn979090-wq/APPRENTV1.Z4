# USULAN SKEMA KERJA: PEMISAHAN PWA & ZLCE + ZLCE MODE SIMPLE (REV-10)

* **Proyek:** RyokoRent Android APK
* **Dasar:** `APPRENToned-main.zip`, `SESSION_STATE.md` (TASK-001..029 DONE), mode **NORMAL**, zlce-check `OK (0 error, 0 warn, 29 task)`
* **Level triase:** L (banyak berkas, struktur direktori, menyentuh jalur build)
* **Status dokumen:** USULAN. Belum ada berkas proyek yang dihapus/dipindah. Task dibuat setelah Anda menyetujui per butir (Bagian 7).

---

## 1. TEMUAN AUDIT (dasar usulan)

### 1.1 Kopling yang WAJIB dijaga agar PWA tidak rusak

| # | Kopling | Bukti | Konsekuensi |
| :-: | :--- | :--- | :--- |
| K1 | `src/App.tsx` baris 39: `import sessionStateActual from '../SESSION_STATE.md?raw'` | grep | `SESSION_STATE.md` **harus tetap di root dengan nama sama**. Dipindah/diganti nama = `vite build` gagal. |
| K2 | `markdownParser.ts` + `zlceValidator.ts` + `zlce-check.py` membaca nama field, kolom, dan nomor bagian 0-7 | kode | Format `SESSION_STATE.md` **tidak boleh diubah**. |
| K3 | `RecoveryTab.tsx` memuat string perintah `scripts/zlce/zlce-snapshot.sh` dan `scripts/zlce/zlce-check.py` | grep | Folder `scripts/zlce/` **tidak dipindah/diganti nama**. |
| K4 | `SettingsView.tsx` baris 450 menampilkan teks `docs/GOOGLE_SHEETS_INTEGRATION.md` | grep | Berkas itu **tidak digabung/diganti nama** (kecuali ikut mengubah kode UI; tidak disarankan). |
| K5 | `clipboard.ts` dipakai 6 komponen (5 komponen PWA + RecoveryTab) | grep | Bukan berkas khusus Studio; masuk daftar beku PWA. |
| K6 | `docs/USAGE.md` bagian 6 berisi **ketentuan operasional aplikasi** (tanggal/jam, tarif F-03, state machine, DB, WhatsApp), bukan isi ZLCE | baca | Bila USAGE digabung, bagian 6 harus dipindah ke `README.md`, **bukan dibuang**. |

### 1.2 Berkas hilang / rujukan yatim

| # | Temuan | Dampak |
| :-: | :--- | :--- |
| H1 | `AI_WORKFLOW.md` tidak ada di root (hanya `templates/AI_WORKFLOW.template.md`). Mode LITE tidak mewajibkannya, tetapi `HANDOVER.md` menyebutnya "otoritatif", dan bagian 6 (triase), 8 (CHECKPOINT BLOCK), 9 (recovery) hanya ada di sana. | Agen baru tidak punya aturan otoritatif; format CHECKPOINT tidak terdefinisi di repo. |
| H2 | **Tidak ada berkas pengujian.** Tidak ada `tests/`, tidak ada skrip `test` di `package.json`, padahal bukti TASK-018..029 menulis "tsx test pass" dan "7/7 lolos". | Bukti DONE tidak dapat direproduksi. Tidak ada jaring pengaman regresi PWA. |
| H3 | `src/data/templates.ts` disebut di `ZLCE_KIT_SINGLE.md` dan `CONTRIBUTING.md`, tidak ada. | Klaim dokumen salah. |
| H4 | `scripts/zlce-check.py` (wrapper root) disebut di `CONTRIBUTING.md`, tidak ada. | Klaim dokumen salah. |
| H5 | `src/types/zlce.ts` `TabType` mendaftar 9 tab (session, initiation, prompt-engine, ..., tutorial); hanya `recovery` yang ada. `TabType` tidak dipakai berkas lain. | Sisa Studio lama; menyesatkan. |
| H6 | `BLUEPRINT.md` M-07 menyebut `ZlceTab.tsx`; berkas tidak ada. `docs/USAGE.md` menyebut tab "Session State" di Studio; tidak ada. | Klaim dokumen salah. |
| H7 | Log audit menyebut arsip ke `docs/archive/`; folder tidak ada. | Rujukan yatim (ringan). |

### 1.3 Duplikasi / ketidakkonsistenan

| # | Temuan |
| :-: | :--- |
| D1 | `HANDOVER.md` = salinan blok di `HANDOVER_PROMPT.md`. Versi ketiga (berbeda isi) ada sebagai string di `RecoveryTab.tsx` baris ~366. |
| D2 | `ZLCE_KIT_SINGLE.md` (38 KB) adalah salinan manual dari `LANDING_PROMPT.md` + `HANDOVER_PROMPT.md` + 9 template + 1 profil. Tidak ada skrip yang menjaga sinkron (rawan drift). |
| D3 | Label versi: ZLCE `v3.2.2` (kit, prompt, kode Studio) vs `v3.5.0` (`BLUEPRINT.md`, `CHANGELOG.md`). Belum jelas mana versi aplikasi dan mana versi metodologi. |
| D4 | `SESSION_STATE.md`: `Timestamp Audit` = 08:45:00, tetapi entri log teratas = 10:15:00 dan WAL `Diperbarui` = 09:20:00. zlce-check tidak mendeteksinya. **Tidak diperbaiki diam-diam** (aturan X1: tidak boleh mengarang jam). |
| D5 | `public/assets/aistudio/review_3ef8cfc7.md` (29 KB) ikut tersalin ke `dist/` (terkirim ke pengguna PWA) padahal dokumen review, tidak dirujuk kode. |
| D6 | `package.json`: `name` = `zlce-studio`; dependensi `@google/genai`, `express`, `dotenv`, `motion` tidak diimpor di `src/` maupun `vite.config.ts`. `metadata.json` = "Remix Ryoappcass". **Hanya dicatat, di luar lingkup** (lihat 8). |
| D7 | `SECURITY.md` dan `CONTRIBUTING.md` berbicara tentang "ZLCE Studio web app" dan repo upstream `ZLCEv3.2.2`, bukan RyokoRent. |

### 1.4 Batasan lingkungan sesi ini
* Jaringan bash nonaktif, `node_modules` tidak ada: `npm ci`, `npm run lint`, `npm run build` **tidak dapat dijalankan AI di sini**. Bukti lint/build = pengguna menempel output (aturan verifikasi: status tetap `IN_PROGRESS` sampai bukti masuk).
* Arsip zip tidak berisi `.git`. `git status/log/diff` tidak dapat dijalankan; verifikasi "PWA tidak tersentuh" memakai `git diff --stat` di mesin pengguna.

---

## 2. PENGELOMPOKAN BERKAS (2 KELOMPOK)

### KELOMPOK A: PWA (aplikasi RyokoRent) → status **BEKU**, hanya boleh disentuh butir A yang disetujui

| Area | Berkas | Perlakuan |
| :--- | :--- | :--- |
| Kode aplikasi | `src/**` **kecuali** 4 berkas Studio (di bawah) | BEKU. Termasuk `App.tsx`, `clipboard.ts`, seluruh `services/`, `components/`, `data/`, `utils/` lain |
| Build & shell | `index.html`, `vite.config.ts`, `tsconfig.json`, `package.json`, `bun.lock`, `.env.example`, `.gitignore`, `metadata.json` | BEKU (kecuali A2: menambah satu entri `scripts.test`) |
| Aset | `public/` (ikon, favicon, `icon.svg`) | BEKU, kecuali A3 memindahkan `public/assets/aistudio/review_3ef8cfc7.md` |
| Dokumen produk | `README.md`, `docs/GOOGLE_SHEETS_INTEGRATION.md`, `docs/TELEGRAM_BOT_INTEGRATION.md`, `LICENSE` | Dipertahankan (K4). `README.md` hanya diperbarui bagian struktur/ketentuan (docs-only) |
| Dokumen review | `docs/CLAUDE_PROMPT.md`, `docs/CLAUDE_REVIEW_GUIDE.md`, `docs/REVIEW_ACTION_PLAN.md`, `docs/periksa/*` (2), `public/assets/aistudio/review_3ef8cfc7.md` | A3: gabung 3 dokumen jadi 1, 3 dokumen hasil review dikumpulkan di `docs/periksa/` |

### KELOMPOK B: ZLCE (metodologi, generator, Studio, pengujian state)

| Area | Berkas | Perlakuan |
| :--- | :--- | :--- |
| Berkas kontrol proyek | `BLUEPRINT.md`, `TASKS.md`, `SESSION_STATE.md` (**tetap root, K1/K2**), `CHANGELOG.md`, `HANDOVER.md` | POKOK (dipertahankan) |
| Aturan kerja | `AI_WORKFLOW.md` | **HILANG → dipulihkan** (Z1), POKOK |
| Skrip uji & generator snapshot | `scripts/zlce/zlce-check.py`, `zlce-collect.py`, `zlce-snapshot.sh` | **DIPERTAHANKAN UTUH** (K3) |
| ZLCE Studio (dalam PWA) | `src/components/RecoveryTab.tsx`, `src/utils/zlceValidator.ts`, `src/utils/markdownParser.ts`, `src/types/zlce.ts` | **DIPERTAHANKAN**; hanya Z6 yang menyentuh (sinkron prompt + hapus `TabType` usang) |
| Generator kit | `LANDING_PROMPT.md`, `HANDOVER_PROMPT.md`, `ZLCE_KIT_SINGLE.md`, `templates/*` (9 + profil), `examples/SESSION_STATE.example.md` | Disederhanakan (Z3-Z5) |
| Panduan | `docs/USAGE.md`, `CONTRIBUTING.md`, `templates/CHECKLISTS.template.md` | Digabung ke `AI_WORKFLOW.md` (Z2) |
| Kebijakan | `SECURITY.md` | Dipertahankan, redaksi disesuaikan (Z7/F1) |

---

## 3. STRUKTUR TARGET (ZLCE MODE SIMPLE)

```text
.
├── BLUEPRINT.md            POKOK
├── TASKS.md                POKOK
├── SESSION_STATE.md        POKOK (tetap root: App.tsx ?raw)
├── AI_WORKFLOW.md          POKOK, dipulihkan; menyerap USAGE + CONTRIBUTING + CHECKLISTS
├── HANDOVER.md             POKOK; menyerap HANDOVER_PROMPT.md (cara pakai + blok prompt)
├── CHANGELOG.md            POKOK
├── README.md  SECURITY.md  LICENSE
├── scripts/zlce/           UTUH (check, collect, snapshot) + zlce-bundle.py (baru, Z5)
├── zlce-kit/               generator kit (dipindah dari root)
│   ├── LANDING_PROMPT.md
│   ├── ZLCE_KIT_SINGLE.md  (dihasilkan skrip, bukan ditulis tangan)
│   ├── examples/SESSION_STATE.example.md
│   └── templates/          BLUEPRINT, TASKS, SESSION_STATE, AI_WORKFLOW, CHANGELOG,
│                           FULL_MODE (gabungan ARCHITECTURE+DATA_MODEL+TESTING+CHECKLISTS),
│                           profiles/DOMAIN_BOOKING.profile.md
├── tests/                  dipulihkan (A2)
├── docs/
│   ├── GOOGLE_SHEETS_INTEGRATION.md   (tetap, K4)
│   ├── TELEGRAM_BOT_INTEGRATION.md
│   └── periksa/            semua dokumen review (CGPT, Claude, @kepek) + REVIEW.md (gabungan 3 dokumen)
└── src/ public/ ...        PWA, beku
```

Hitungan berkas Markdown di root: **12 → 9** (`+AI_WORKFLOW`, `-LANDING_PROMPT`, `-HANDOVER_PROMPT`, `-ZLCE_KIT_SINGLE`, `-CONTRIBUTING`). Template: 9 + 1 profil → **5 + 1 FULL gabungan + 1 profil**. Dokumen `docs/`: 7 + 2 review → **3 + folder `periksa/`**.

---

## 4. GERBANG PELINDUNG PWA (berlaku untuk SEMUA task)

**G1 Daftar beku:** kelompok A pada Bagian 2. Tidak ada task yang boleh mengubahnya kecuali tercantum eksplisit di kolom "Menyentuh PWA".
**G2 Baseline:** sebelum task apa pun, pengguna menjalankan `npm ci && npm run lint && npm run build` dan menempel output (A1).
**G3 Setiap task** menutup dengan perintah berikut (output ditempel pengguna; tanpa itu status tetap `IN_PROGRESS`):
```bash
npm run lint
npm run build
python3 scripts/zlce/zlce-check.py . --no-git
git diff --stat            # berkas beku tidak boleh muncul, kecuali yang tercantum di task
ls dist | grep -E "manifest.webmanifest|sw.js"   # PWA masih terbangun
```
**G4 Task docs-only** (tanpa menyentuh `src/`, `public/`, `vite.config.ts`): lint/build tetap dijalankan sekali di task penutup (F1), tetapi G3 `git diff --stat` wajib per task.
**G5 Rollback:** satu task = satu commit `<tipe>(<lingkup>): ... [TASK-0NN]`; kegagalan G3 = `git revert` commit task tersebut (dengan persetujuan Anda).

---

## 5. DAFTAR BUTIR USULAN (pilih mana yang disetujui)

Kolom **Wajib** = disarankan kuat; **Opsi** = dapat ditolak tanpa merusak butir lain.

### KELOMPOK A: PWA

| ID | Judul | Isi kerja | Menyentuh PWA? | Rekomendasi |
| :-: | :--- | :--- | :--- | :-: |
| **A1** | Baseline & Batas Beku PWA | Pengguna menempel output baseline G2. Tulis "Batas Beku PWA" (daftar Bagian 2A + kopling K1-K6) ke `BLUEPRINT.md`. | Tidak (docs) | **Wajib** |
| **A2** | Pulihkan suite pengujian logika | Buat `tests/` (jalankan dengan `tsx`) dari 7 kasus yang tercatat di bukti TASK-029: tarif deal harian, status unit parkir, soft cancel, backup DB korup, auto-snapshot impor, normalizer jam/tanggal, link WA jujur. Tambah `scripts.test` di `package.json`. Bila Anda masih punya berkas uji asli, **lampirkan; saya pakai itu, bukan menulis ulang** (Q-04). | `package.json` +1 entri `test`; `src/` hanya dibaca | **Wajib** |
| **A3** | Bersihkan `public/` & gabung dokumen review | Pindahkan `public/assets/aistudio/review_3ef8cfc7.md` ke `docs/periksa/` (hilang dari `dist/`). Gabung `CLAUDE_PROMPT` + `CLAUDE_REVIEW_GUIDE` + `REVIEW_ACTION_PLAN` → `docs/REVIEW.md`. Perbarui rujukan. | Hanya `public/` (1 berkas dokumen, tidak dirujuk kode) | Disarankan |

### KELOMPOK B: ZLCE

| ID | Judul | Isi kerja | Rekomendasi |
| :-: | :--- | :--- | :-: |
| **Z1** | Pulihkan `AI_WORKFLOW.md` | Dari `templates/AI_WORKFLOW.template.md`, isi untuk RyokoRent (konvensi, enum, guardrail, tier baca, verifikasi, triase, git, **CHECKPOINT BLOCK**, recovery A-D, mode LITE). Tidak mengubah format `SESSION_STATE.md`. | **Wajib** |
| **Z2** | Gabung panduan ke `AI_WORKFLOW.md` | Serap `docs/USAGE.md` bagian 1-5 (matriks situasi, 3 jalur), `CONTRIBUTING.md` (aturan verifikasi & perubahan kit), `CHECKLISTS.template.md` (pre-merge/pre-production). **Pindahkan `USAGE.md` bagian 6 ke `README.md`** (K6). Hapus `USAGE.md`, `CONTRIBUTING.md`. | Disarankan |
| **Z3** | Gabung `HANDOVER_PROMPT.md` → `HANDOVER.md` | `HANDOVER.md` = "Cara Pakai" + blok prompt (isi blok **tidak diubah**). Hapus `HANDOVER_PROMPT.md`. | Disarankan |
| **Z4** | Pindah & rampingkan generator kit | Pindah `LANDING_PROMPT.md`, `ZLCE_KIT_SINGLE.md`, `templates/`, `examples/` ke `zlce-kit/`. Gabung `ARCHITECTURE`+`DATA_MODEL`+`TESTING`+`CHECKLISTS` template → `FULL_MODE.template.md` (kapabilitas FULL tetap ada). Perbarui rujukan di `LANDING_PROMPT` dan perintah contoh zlce-check. | Opsi |
| **Z5** | Skrip `zlce-bundle.py` | Skrip baru di `scripts/zlce/` yang menghasilkan `ZLCE_KIT_SINGLE.md` dari berkas sumber + mode `--check` (gagal bila bundel tidak sinkron). Menghentikan drift manual (D2). Tidak mengubah 3 skrip lama. | Opsi (butuh Z4) |
| **Z6** | Rapikan ZLCE Studio | Sinkronkan string prompt handover di `RecoveryTab.tsx` dengan blok `HANDOVER.md` (D1); hapus `TabType` usang di `types/zlce.ts` (H5). Semua fitur Recovery (wizard A-D, preset, bundel handover, snapshot) **tetap**. | Opsi |
| **Z7** | Normalisasi versi & hygiene state | Tetapkan satu skema label versi (Q-05). Hapus klaim `templates.ts`, `ZlceTab.tsx`, root wrapper, tab Studio yang tidak ada (H3, H4, H6). Redaksi ulang `SECURITY.md` untuk RyokoRent + ZLCE. Selaraskan `Timestamp Audit` bila Anda memberi jam sumber (D4). Arsip log lama ke `docs/archive/` (opsional, H7). | Disarankan |
| **F1** | Sinkronisasi dokumen & verifikasi akhir | Perbarui `README.md` (struktur proyek), `BLUEPRINT.md` M-07, `CHANGELOG.md`, `SESSION_STATE.md`; cek tautan mati (`grep` semua nama berkas yang dihapus/dipindah = 0 rujukan); jalankan seluruh G3 + `npm run test`. | **Wajib** |

---

## 6. RENCANA TASK (setelah disetujui; mengikuti format `TASKS.md`)

Penomoran lanjut dari `TASK-029`. Satu `IN_PROGRESS` pada satu waktu. Tabel di bawah = usulan; hanya butir yang Anda setujui yang didaftarkan.

| Task | Butir | Dependensi | Docs Terkait (Tier 1) | Docs Impact | Acceptance Criteria (ringkas) | Metode Verifikasi |
| :-: | :-: | :-: | :--- | :--- | :--- | :--- |
| `TASK-030` | A1 | - | `BLUEPRINT.md`, `src/App.tsx` | `BLUEPRINT.md`, `SESSION_STATE.md` | 1) Output baseline lint/build/zlce-check tertempel. 2) Bagian "Batas Beku PWA" memuat K1-K6 + daftar beku. 3) Tidak ada berkas `src/` berubah. | G3 |
| `TASK-031` | A2 | TASK-030 | `src/services/bookingEngine.ts`, `src/utils/whatsappChatParser.ts`, `src/services/storageService.ts`, `src/services/whatsappService.ts` | `BLUEPRINT.md` (bagian 8 strategi uji), `README.md` | 1) 7 kasus uji ada di `tests/`. 2) `npm run test` lolos 7/7. 3) Satu-satunya perubahan `package.json` = entri `scripts.test`. 4) `src/` tidak berubah. | `npm run test`, G3 |
| `TASK-032` | A3 | TASK-030 | `docs/CLAUDE_*.md`, `docs/REVIEW_ACTION_PLAN.md` | `README.md`, `SESSION_STATE.md` | 1) `dist/` tidak memuat `.md`. 2) `docs/REVIEW.md` memuat seluruh konten 3 dokumen asal (tanpa pengurangan substansi). 3) 0 rujukan ke path lama. | G3, `find dist -name "*.md"` = kosong |
| `TASK-033` | Z1 | TASK-030 | `templates/AI_WORKFLOW.template.md`, `HANDOVER_PROMPT.md`, `scripts/zlce/zlce-check.py` | `HANDOVER.md`, `SESSION_STATE.md` | 1) `AI_WORKFLOW.md` bagian 1-10 terisi, CHECKPOINT BLOCK terdefinisi. 2) Enum/aturan selaras dengan `zlce-check.py`. 3) zlce-check tetap `0 error`. | G3 |
| `TASK-034` | Z2 | TASK-033 | `docs/USAGE.md`, `CONTRIBUTING.md`, `templates/CHECKLISTS.template.md` | `AI_WORKFLOW.md`, `README.md` | 1) Isi unik USAGE 1-5, CONTRIBUTING, CHECKLISTS ada di `AI_WORKFLOW.md`. 2) USAGE bagian 6 utuh di `README.md`. 3) 0 rujukan ke berkas terhapus. | G3, `grep` rujukan |
| `TASK-035` | Z3 | TASK-033 | `HANDOVER.md`, `HANDOVER_PROMPT.md` | `HANDOVER.md`, `AI_WORKFLOW.md` | 1) Blok prompt di `HANDOVER.md` identik byte-per-byte dengan blok `HANDOVER_PROMPT.md` lama. 2) `HANDOVER_PROMPT.md` terhapus, 0 rujukan. | `diff` blok, G3 |
| `TASK-036` | Z4 | TASK-034, TASK-035 | `LANDING_PROMPT.md`, `ZLCE_KIT_SINGLE.md`, `templates/*` | `LANDING_PROMPT.md`, `AI_WORKFLOW.md`, `README.md` | 1) Struktur `zlce-kit/` sesuai Bagian 3. 2) `FULL_MODE.template.md` memuat 4 bagian asal utuh. 3) `zlce-check.py --state zlce-kit/examples/SESSION_STATE.example.md --no-git` = OK. | G3 |
| `TASK-037` | Z5 | TASK-036 | `zlce-kit/ZLCE_KIT_SINGLE.md` | `AI_WORKFLOW.md` | 1) `zlce-bundle.py` menghasilkan kit tanpa selisih bermakna dari yang ada. 2) `--check` exit 0 saat sinkron, exit 1 saat sengaja dirusak. 3) 3 skrip lama tidak berubah (hash sama). | jalankan skrip, `sha256sum` |
| `TASK-038` | Z6 | TASK-035, TASK-031 | `src/components/RecoveryTab.tsx`, `src/types/zlce.ts`, `HANDOVER.md` | `BLUEPRINT.md` M-07 | 1) Prompt di Recovery = blok `HANDOVER.md`. 2) Wizard A-D, preset, bundel handover, snapshot berfungsi (uji manual daftar). 3) `tsc` 0 error, `build` lolos, `npm run test` lolos. | G3 + `npm run test` + uji manual |
| `TASK-039` | Z7 | TASK-036 | `BLUEPRINT.md`, `SECURITY.md`, `CHANGELOG.md`, `SESSION_STATE.md` | semua yang diubah | 1) Satu skema label versi di seluruh repo. 2) 0 klaim berkas/tab yang tidak ada. 3) Format `SESSION_STATE.md` tidak berubah. | `grep`, G3 |
| `TASK-040` | F1 | semua yang disetujui | semua | `README.md`, `BLUEPRINT.md`, `CHANGELOG.md`, `SESSION_STATE.md` | 1) Semua G3 + `npm run test` lolos. 2) 0 tautan mati. 3) `dist` memuat manifest + service worker. 4) `git diff --stat` terhadap baseline: berkas beku tidak berubah selain yang disetujui. | G3 lengkap |

Urutan eksekusi: 030 → (031, 032, 033 berurutan, satu per satu) → 034 → 035 → 036 → 037 → 038 → 039 → 040. Task yang ditolak dilewati; dependensi disesuaikan.

---

## 7. KEPUTUSAN YANG SAYA BUTUHKAN DARI ANDA

**7.1 Persetujuan butir.** Balas dengan menyebut ID, contoh: `Setujui A1, A2, A3, Z1, Z2, Z3, F1; tolak Z4, Z5; ubah Z6: ...`. Balasan pendek ("lanjut", "oke") **tidak** saya anggap persetujuan.

**7.2 Pertanyaan terbuka** (akan dicatat di `SESSION_STATE.md` bagian 4 sebagai `Q-04` s/d `Q-07`; ID lanjut dari nomor tertinggi `ASM-03`):

| ID | Pertanyaan | Mempengaruhi |
| :-: | :--- | :-: |
| `Q-04` | Apakah berkas uji "tsx" asli (7 kasus) masih Anda punya? Bila ya, lampirkan. Bila tidak, saya tulis ulang dari deskripsi bukti. | A2 |
| `Q-05` | ~~Skema versi~~ **TERJAWAB (Opsi 2, lihat Bagian 10).** | Z7 |
| `Q-06` | "ZLCE generator" yang harus dipertahankan: apakah yang Anda maksud (a) generator snapshot (`zlce-snapshot.sh` + wizard Recovery), (b) generator dokumen proyek (`LANDING_PROMPT` + `templates/` + kit), atau keduanya? Usulan ini mempertahankan **keduanya**; Z4/Z5 hanya memindah dan merampingkan (b). | Z4, Z5 |
| `Q-07` | Jam sumber untuk merapikan ketidakkonsistenan `Timestamp Audit` 08:45:00 vs log 10:15:00. Berikan jam resmi yang berlaku (atau izinkan saya menulis `2026-10-26 jam: ?`). | Z7 |

---

## 8. DI LUAR LINGKUP (dicatat, tidak dikerjakan tanpa persetujuan terpisah)

* Pembersihan `package.json`: `name: zlce-studio`, dependensi tak terpakai (`@google/genai`, `express`, `dotenv`, `motion`), `metadata.json`. Menyentuh jalur build PWA dan `bun.lock`; butuh task tersendiri bila diinginkan.
* Perubahan logika bisnis aplikasi (tarif, state machine, parser). Tidak disentuh sama sekali.
* Mengubah format `SESSION_STATE.md` atau struktur parser Studio.

---

## 9. RISIKO & MITIGASI

| Risiko | Mitigasi |
| :--- | :--- |
| `vite build` gagal karena `SESSION_STATE.md?raw` | K1: berkas tidak dipindah; G3 `build` tiap task |
| Konten ketentuan operasional hilang saat USAGE dihapus | K6: dipindah ke `README.md`, AC `TASK-034` poin 2 |
| Rujukan yatim setelah pemindahan | AC "0 rujukan" berbasis `grep` di Z2, Z3, Z4, F1 |
| Bukti lint/build tidak dapat dijalankan AI | Perintah persis diberikan, status tetap `IN_PROGRESS` sampai output ditempel |
| Kehilangan kapabilitas FULL saat template digabung | AC `TASK-036` poin 2 (4 bagian asal utuh) |
| Pengujian ulang (A2) menormalkan perilaku yang salah | Uji ditulis dari bukti tercatat + kode saat ini; selisih dilaporkan, bukan disembunyikan |

---

## 10. KEPUTUSAN PENGGUNA (pembaruan)

| ID | Jawaban | Dampak pada usulan |
| :-: | :--- | :--- |
| `Q-04` | Berkas uji tsx **tidak ada** | A2 = tulis ulang dari bukti TASK-029 + kode saat ini. Jika perilaku kode berbeda dari bukti lama, selisih dilaporkan ke Anda sebelum uji dikunci |
| `Q-05` | **Opsi 2:** aplikasi **3.5.0**, metodologi ZLCE **v3.2.2** (menggantikan usulan 3.3.0) | Z7 hanya mengubah `BLUEPRINT.md` baris 3 dan `README.md` baris 196 ("ZLCE v3.5.0" → "ZLCE v3.2.2"). Label di kit, prompt, skrip, dan 4 berkas Studio sudah v3.2.2: **tidak diubah**. `CHANGELOG.md` `[3.5.0]` dan `BLUEPRINT.md` baris 1 (aplikasi) tetap |
| `Q-06` | **Keduanya** dipertahankan | Generator snapshot dan generator dokumen proyek tidak dikurangi; Z4/Z5 hanya memindah dan merampingkan |
| `Q-07` | **YA** (ditafsirkan izin `jam: ?`, dicatat sebagai `ASM-04`) | `Timestamp Audit` tidak dimajukan; entri baru memakai `2026-10-26 jam: ?` |
| `Q-08` | **Dibiarkan** (konsekuensi Opsi 2) | 0 berkas PWA beku diubah untuk urusan label. `seedData.ts` `version` tidak disentuh |

**Perubahan pada butir akibat keputusan di atas:**
* **Z7** (`TASK-039`): cakupan label menyempit menjadi 2 baris dokumen (di atas). Bagian lain Z7 tetap: hapus klaim `templates.ts`, `ZlceTab.tsx`, wrapper root, tab Studio yang tidak ada; redaksi ulang `SECURITY.md`; arsip log opsional. `Timestamp Audit` tidak dimajukan (`ASM-04`).
* **Z6** (`TASK-038`): string prompt di `RecoveryTab.tsx` tetap berlabel v3.2.2, sehingga sinkron dengan `HANDOVER.md` tanpa penyesuaian versi.
* **AC `TASK-039` poin 1** menjadi: "`grep` label ZLCE menghasilkan hanya `v3.2.2`; label aplikasi hanya `3.5.0`".

**Status persetujuan butir:** BELUM ada. Butir A1-A3, Z1-Z7, F1 menunggu balasan berformat ID. Semua pertanyaan terbuka (`Q-04` s/d `Q-08`) sudah terjawab; satu-satunya yang masih `OPEN` adalah asumsi `ASM-04`.

---

## 11. PERSETUJUAN BUTIR (pengguna)

* **Disetujui:** A1, A2, A3, Z1, Z2, Z3, Z4, Z5, Z6, Z7, F1 → didaftarkan sebagai `TASK-030` s/d `TASK-040` (lihat `TASKS.md`).
* **Perubahan A3:** dokumen review di `docs/` dan `docs/periksa/` **dihapus**, tidak digabung ke `docs/REVIEW.md`. `public/` dibersihkan. Bagian 5 dan 6 di atas yang menyebut `docs/REVIEW.md` digantikan oleh keputusan ini (`TASK-032`).
* **Temuan baru:** `Q-09` (TASK-029 menyebut `src/utils/time.ts`, `nowWibLabel()`, Vitest; tidak ada di zip).
