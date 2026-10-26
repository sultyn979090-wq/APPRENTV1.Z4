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
