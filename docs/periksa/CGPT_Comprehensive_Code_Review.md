# RyokoRent — Comprehensive Code & Architecture Review

**Jenis dokumen:** Audit statis dan rencana peningkatan  
**Sistem:** RyokoRent Android APK / aplikasi React + TypeScript + PWA  
**Tanggal:** 26 Oktober 2026  
**Status:** Rekomendasi teknis; perlu verifikasi melalui test runtime sebelum dinyatakan lulus produksi

---

## 1. Executive Summary

### Penilaian sementara

**Skor audit statis indikatif: 68/100 — perlu perbaikan sebelum digunakan sebagai sistem transaksi produksi yang kritis.**

Skor ini adalah penilaian rekayasa berdasarkan struktur dan implementasi yang ditinjau, bukan persentase fitur yang berhasil, hasil penetration test, atau jaminan stabilitas produksi.

RyokoRent memiliki fondasi modular yang layak dipertahankan: terdapat pemisahan layanan untuk booking, penyimpanan, WhatsApp, Google Sheets, dan Telegram; model status booking eksplisit; serta dukungan PWA dan backup JSON. Namun, banyaknya fitur belum otomatis menjamin konsistensi transaksi.

### Risiko utama

1. **Konsistensi booking:** LocalStorage tidak memberikan transaksi atomik lintas perangkat atau operator.
2. **Bentrok jadwal:** pengecekan ketersediaan dan penyimpanan tidak otomatis menjadi satu operasi atomik.
3. **Pemulihan data:** validasi JSON perlu memeriksa skema, versi, tipe data, dan referensi antardata sebelum restore.
4. **Parser WhatsApp:** variasi teks, waktu ambigu, dan pemetaan identitas pendukung berpotensi menghasilkan data salah.
5. **Perhitungan denda:** batas toleransi dan pembulatan perlu ditetapkan secara eksplisit dan diuji.
6. **Integrasi eksternal:** status simulasi, antrean offline, retry, deduplikasi, dan pengamanan token perlu diperjelas.
7. **Privasi:** data identitas pelanggan yang disimpan di browser atau backup perlu dikendalikan dengan ketat.

### Kesimpulan

Prioritas peningkatan bukan menambah fitur atau animasi terlebih dahulu. Prioritas pertama adalah menjaga agar booking, armada, tarif, denda, dan data pelanggan tetap benar saat terjadi konflik, koneksi terputus, penyimpanan penuh, atau pemulihan backup.

---

## 2. Kelebihan Arsitektur yang Perlu Dipertahankan

### 2.1 Pemisahan tanggung jawab

Modul yang menjadi titik awal audit dan refactoring:

- `src/services/bookingEngine.ts` — aturan booking, transisi status, ketersediaan, dan tarif.
- `src/types/ryoko.ts` — model data dan tipe status.
- `src/utils/whatsappChatParser.ts` — ekstraksi data dari pesan pelanggan.
- `src/services/storageService.ts` — persistensi lokal, ekspor, dan impor.
- `src/services/whatsappService.ts` — pembentukan pesan/URL WhatsApp.
- `src/services/googleSheetsService.ts` — ekspor/sinkronisasi Google Sheets.
- `src/services/telegramBotService.ts` — notifikasi Telegram.
- `src/components/NewBookingModal.tsx` — form pembuatan booking.
- `src/components/DigitalReceiptModal.tsx` — nota digital dan berbagi melalui WhatsApp.
- `vite.config.ts` — konfigurasi PWA/Workbox.

Pemisahan ini mengurangi duplikasi aturan bisnis dan memudahkan pengujian. Pertahankan aturan domain di service/domain layer; jangan memindahkan validasi kritis hanya ke komponen UI.

### 2.2 Model status eksplisit

Lima status booking yang ditinjau:

1. `ryokou_booking` — Pemesanan Baru.
2. `ryokou_approved` — Unit Dikunci.
3. `ryokou_disewa` — Sedang Jalan.
4. `ryokou_diservis` — Perbaikan Bengkel.
5. `ryokou_selesai` — Unit Kembali.

Daftar transisi eksplisit seperti `NEXT_STATUS_TRANSITIONS` lebih aman daripada perubahan status bebas. Namun, validitas transisi belum membuktikan bahwa status booking, posisi unit, tracking kurir, dan histori servis selalu berubah secara konsisten.

### 2.3 Dukungan operasi lokal dan PWA

Manifest, `display: standalone`, Workbox, ekspor JSON, impor JSON, dan estimasi pemakaian storage adalah fondasi berguna. Tetap perlakukan semua kemampuan ini sebagai fitur yang harus diuji pada perangkat, bukan bukti bahwa aplikasi sudah tahan kegagalan.

### 2.4 Perhatian terhadap privasi

Fungsi penyamaran NIK dan sanitasi ekspor merupakan awal yang baik. Tingkatkan dengan minimisasi data, kontrol akses, redaksi log, masa retensi, serta penyimpanan secret di server.

---

## 3. Temuan, Risiko, dan Saran Perbaikan

> **Catatan audit:** klasifikasi berikut adalah prioritas risiko rekayasa. Semua butir harus diverifikasi dengan pengujian yang dapat diulang sebelum dinyatakan sebagai defect produksi yang telah terbukti.

### P0 — Kritis

#### P0-01. LocalStorage tidak cukup sebagai sumber kebenaran multioperator

**Risiko:** dua operator dapat membaca snapshot yang sama, memperbarui booking berbeda, lalu menimpa perubahan satu sama lain. Listener `storage` membantu mendeteksi perubahan antarkonteks, tetapi tidak menyediakan transaksi read-modify-write lintas perangkat.

**Saran:**
- Untuk operasi satu perangkat, gunakan penyimpanan transaksional lokal seperti IndexedDB dan mekanisme konflik yang eksplisit.
- Untuk beberapa operator/perangkat, pindahkan sumber kebenaran booking ke backend dengan database transaksional.
- Terapkan optimistic concurrency melalui `version`/ETag dan tolak update bila versi telah berubah.
- Gunakan idempotency key untuk aksi yang dapat terkirim ulang.
- Jangan menganggap pengecekan jadwal di klien sebagai jaminan anti-double-booking.

**Kriteria selesai:** dua permintaan bersamaan untuk unit dan rentang waktu yang bertabrakan tidak dapat sama-sama berhasil.

#### P0-02. Validasi backup/restore belum cukup kuat

**Risiko:** memeriksa keberadaan koleksi seperti `motors`, `units`, dan `bookings` saja tidak membuktikan seluruh record valid. Struktur parsial dapat lolos, sedangkan fallback ke data awal setelah error parsing dapat membuat operator mengira data telah dipulihkan.

**Saran:**
- Tambahkan `schemaVersion`.
- Validasi JSON dengan schema runtime, misalnya Zod, sebelum menyentuh database aktif.
- Validasi enum, angka, tanggal, ID unik, referensi antarentitas, dan invariant domain.
- Buat snapshot sebelum restore.
- Jalankan migrasi versi berurutan.
- Bila restore gagal, tampilkan error eksplisit dan jangan diam-diam mengganti database aktif dengan seed data.
- Lakukan backup dan restore drill berkala.

**Kriteria selesai:** file rusak, versi tidak didukung, atau referensi ID tidak valid ditolak tanpa mengubah database aktif.

#### P0-03. Mapping identitas pendukung perlu diselaraskan

**Risiko:** bila KTP dipetakan ke `SIM_C`, data bisa terlihat valid secara tipe tetapi salah secara makna. Model `SupportIdType` harus sesuai dengan kebijakan identitas yang benar-benar diterima.

**Saran:**
- Putuskan apakah KTP termasuk ID pendukung yang sah.
- Bila ya, tambahkan nilai enum `KTP`.
- Bila tidak, tampilkan warning yang memaksa operator memilih jenis identitas yang benar.
- Simpan nilai asli hasil parsing untuk audit koreksi, tetapi jangan menampilkan data sensitif berlebihan.
- Hindari mengubah satu jenis identitas menjadi jenis lain secara otomatis.

**Kriteria selesai:** tidak ada pemetaan diam-diam antarjenis identitas.

#### P0-04. Batas toleransi dan denda harus menjadi spesifikasi eksplisit

**Risiko:** cabang ShortRent dan sewa harian/bulanan dapat memperlakukan menit ke-60 secara berbeda. Pembulatan menit/jam dan batas tier juga dapat menyebabkan perbedaan tagihan.

**Saran:**
- Definisikan aturan per kategori tarif: waktu mulai denda, pembulatan, tier, dan apakah toleransi inklusif.
- Gunakan epoch atau timestamp bertipe konsisten; hindari perbandingan tanggal string.
- Simpan snapshot kebijakan tarif yang digunakan saat transaksi agar perubahan tarif tidak mengubah tagihan lama.
- Gunakan rupiah sebagai integer, bukan floating point.
- Minta persetujuan operator untuk koreksi manual denda dan simpan alasan di audit log.

**Kriteria selesai:** hasil seluruh kasus batas cocok dengan tabel aturan bisnis yang disahkan.

#### P0-05. Perlindungan data pelanggan dan secret

**Risiko:** token integrasi yang disimpan di browser dapat diakses oleh kode pada origin yang sama, termasuk saat terjadi XSS. Backup juga dapat mengandung identitas dan kontak pelanggan.

**Saran:**
- Pindahkan token Telegram dan secret integrasi ke backend.
- Minimalkan data yang dimasukkan ke log dan notifikasi.
- Redaksi NIK/identitas dan nomor telepon pada ekspor yang tidak membutuhkan data penuh.
- Tentukan siapa yang boleh melihat, mengekspor, menghapus, atau mengubah data.
- Tetapkan masa retensi dan prosedur penghapusan sesuai kebutuhan bisnis dan kewajiban hukum.
- Jangan mengirim data identitas lengkap ke Google Sheets atau Telegram tanpa kebutuhan yang jelas.

**Kriteria selesai:** secret tidak berada di bundle/browser storage dan ekspor mengikuti kebijakan minimisasi data.

### P1 — Penting untuk operasional

#### P1-01. Parser WhatsApp perlu alur ekstraksi dan konfirmasi

Parser berbasis label dan pemisah `:` dapat bekerja untuk template terstruktur, tetapi teks bebas dapat memiliki urutan berbeda, beberapa field dalam satu baris, singkatan, atau waktu ambigu.

**Saran:**
- Pisahkan tahap `extract → normalize → validate → operator review → commit`.
- Jangan menyimpan waktu default sebagai nilai final tanpa konfirmasi.
- Simpan warning per field dengan kode terstruktur, bukan hanya string pesan.
- Tolak rentang waktu saat selesai <= mulai.
- Cocokkan motor berdasarkan ID/katalog, bukan keyword saja.
- Uji pesan dengan typo, baris terbalik, tanggal tanpa tahun, format 12/24 jam, dan nomor telepon dengan awalan berbeda.

#### P1-02. Booking dan posisi unit perlu invariant lintas entitas

**Risiko:** status booking dan posisi unit dapat berbeda jika perubahan dilakukan dari jalur berbeda atau terjadi kegagalan di tengah proses.

**Saran:**
- Buat fungsi domain untuk serah-terima kurir, mulai sewa, pengembalian, masuk servis, dan keluar servis.
- Setiap fungsi memvalidasi precondition dan mengubah seluruh entitas terkait dalam satu transaksi.
- Wajibkan nama/ID kurir saat posisi `kurir`.
- Wajibkan lokasi pool saat posisi `parkir`.
- Wajibkan alasan dan histori saat status berubah menjadi `servis`.
- Buat job rekonsiliasi untuk menemukan kombinasi status yang mustahil.

#### P1-03. Antrean Google Sheets harus tahan refresh dan retry

**Risiko:** antrean terbatas seperti `queue.slice(-50)` dapat membuang item lama. Retry tanpa idempotensi dapat menghasilkan baris ganda.

**Saran:**
- Gunakan event ID unik.
- Simpan status antrean: `pending`, `sending`, `sent`, `failed`.
- Terapkan exponential backoff dengan jitter.
- Hapus item hanya setelah acknowledgment yang valid.
- Simpan error terakhir dan waktu percobaan.
- Bedakan pesan “disiapkan”, “dalam antrean”, dan “terkirim”.

#### P1-04. Telegram harus membedakan simulasi dan pengiriman nyata

**Risiko:** mengembalikan `success: true` saat token/Chat ID tidak tersedia dapat membuat UI mengira alert telah terkirim.

**Saran:**
- Gunakan hasil bertipe `sent | simulated | queued | failed`.
- Proses callback inline keyboard di backend.
- Verifikasi identitas pengguna Telegram, booking, status terkini, dan otorisasi sebelum menjalankan aksi.
- Buat callback idempotent dan kedaluwarsa.
- Jangan meletakkan data pribadi berlebihan di teks notifikasi.

#### P1-05. Penghapusan booking harus mengikuti kebijakan domain

**Saran:**
- Larang penghapusan permanen untuk booking aktif.
- Gunakan pembatalan dengan alasan, operator, dan timestamp.
- Sentralisasikan aturan di domain/service layer; UI hanya menyampaikan hasil.
- Audit semua status, termasuk `ryokou_approved`, `ryokou_disewa`, dan `ryokou_diservis`.
- Tetapkan kebijakan retensi untuk booking selesai.

#### P1-06. Tetapkan observability operasional

Tambahkan:
- Log terstruktur dengan correlation ID.
- Metrik jumlah booking gagal, konflik jadwal, restore gagal, dan antrean integrasi tertunda.
- Notifikasi untuk antrean yang terlalu lama.
- Audit trail untuk perubahan tarif, denda, status, dan penghapusan/pembatalan.
- Tampilan status sinkronisasi yang tidak menyamakan simulasi dengan sukses.

### P2 — UX dan maintainability

- Uji viewport 360, 375, 390, dan 412 px serta keyboard virtual Android.
- Pastikan tombol aksi utama dapat dijangkau satu tangan dan tidak tertutup navigasi bawah.
- Gunakan safe area untuk mode PWA standalone.
- Beri indikator penyimpanan: tersimpan, belum tersimpan, sinkronisasi, atau gagal.
- Tambahkan konfirmasi untuk data hasil parser yang ambigu.
- Samakan normalisasi nomor telepon dan pembentukan URL WhatsApp di semua modul.
- Kurangi duplikasi format booking dengan satu DTO kanonis.
- Tambahkan schema migration test untuk setiap versi data.

---

## 4. Matriks Kepatuhan Aturan Bisnis

Definisi lengkap BR-01 sampai BR-08 harus menjadi sumber acuan resmi. Matriks ini merupakan pemetaan awal berdasarkan area yang tampak dalam implementasi; label “parsial” berarti belum cukup bukti untuk menyatakan kepatuhan penuh.

| ID | Area | Status audit | Tindakan utama |
|---|---|---|---|
| BR-01 | Tarif dan durasi | Parsial | Uji batas tier, snapshot tarif, dan pembulatan |
| BR-02 | Transisi status booking | Terimplementasi secara struktural | Uji semua transisi dan penolakan transisi ilegal |
| BR-03 | Validasi transaksi | Parsial | Transaksi atomik, versioning, idempotensi |
| BR-04 | Turnaround dan toleransi | Parsial | Uji interval 60 menit dan booking yang sedang berjalan |
| BR-05 | Denda | Parsial | Tabel keputusan resmi dan boundary tests |
| BR-06 | Posisi armada/kurir | Parsial | Invariant booking-unit-tracking |
| BR-07 | Servis tujuh kategori | Model tersedia | Uji histori, biaya, jadwal, dan status servis |
| BR-08 | Penyimpanan/integrasi | Parsial | Validasi restore, antrean tahan gagal, dan pengamanan secret |

### 4.1 Matriks 13 field booking

| No. | Field | Catatan audit | Rekomendasi |
|---:|---|---|---|
| 1 | Nama | Tersedia di model/parser | Wajib dan trim whitespace |
| 2 | Alamat KTP | Field opsional pada model | Validasi sesuai kebijakan |
| 3 | ID pendukung | Potensi mapping KTP → SIM C | Selaraskan enum dan template |
| 4 | Alamat saat ini | Field opsional | Pertahankan rumah/kos/hotel |
| 5 | ID sosmed | Field opsional | Jangan mewajibkan tanpa kebutuhan |
| 6 | Nomor telepon | `nomorWa` | Normalisasi dan validasi |
| 7 | Nomor darurat | Field opsional | Validasi format, konfirmasi operator |
| 8 | Jadwal mulai | Timestamp dan string jadwal | Wajib, timezone konsisten |
| 9 | Jadwal selesai | Timestamp dan string jadwal | Harus lebih besar dari mulai |
| 10 | Lokasi pengantaran | Field model tersedia | Validasi lokasi dan instruksi |
| 11 | Lokasi penjemputan | Field model tersedia | Validasi lokasi dan instruksi |
| 12 | Model unit motor | ID motor dan snapshot nama | Gunakan katalog motor yang valid |
| 13 | Jumlah helm | Field opsional; parser memiliki default | Default harus jelas dan dapat dikoreksi |

Keberadaan field di model tidak otomatis membuktikan bahwa field tampil di form, kwitansi, pesan WhatsApp, dan ekspor. Buat contract test yang membandingkan keempat output untuk satu fixture booking.

### 4.2 Armada dan servis

| Area | Kriteria yang harus dipenuhi |
|---|---|
| `parkir` | Pool harus diketahui: Malang Dinoyo atau Batu Sisir |
| `kurir` | Kurir penanggung jawab wajib tercatat |
| `disewa` | Harus terkait booking aktif yang valid |
| `servis` | Tidak boleh dialokasikan ke booking yang berkonflik |
| Tujuh kategori servis | Oli Mesin, Oli Gardan, Kampas Rem, Ganti Ban, CVT Part, Aki, Kecelakaan |
| Anti-hapus booking | Tidak dapat dilewati dengan memanggil service dari jalur lain |
| Buffer 60 menit | Interval awal/akhir dan batas tepat harus konsisten |

---

## 5. Contoh Kode Rekomendasi

Contoh berikut adalah pola implementasi. Sesuaikan nama field dan dependensi dengan tipe aktual proyek sebelum diterapkan.

### 5.1 Validasi runtime backup dengan Zod

```typescript
import { z } from "zod";

const BookingStatusSchema = z.enum([
  "ryokou_booking",
  "ryokou_approved",
  "ryokou_disewa",
  "ryokou_diservis",
  "ryokou_selesai",
]);

const BookingSchema = z.object({
  id: z.number().int().positive(),
  noBooking: z.string().min(1),
  status: BookingStatusSchema,
  nama: z.string().min(1),
  nomorWa: z.string().min(1),
  motorId: z.number().int().positive(),
  startEpoch: z.number().finite(),
  endEpoch: z.number().finite(),
}).refine(
  (booking) => booking.endEpoch > booking.startEpoch,
  { message: "Waktu selesai harus setelah waktu mulai." }
);

const DatabaseSchema = z.object({
  schemaVersion: z.number().int().positive(),
  motors: z.array(z.unknown()),
  units: z.array(z.unknown()),
  bookings: z.array(BookingSchema),
  settings: z.record(z.string(), z.unknown()),
});

export function validateBackup(json: string) {
  let raw: unknown;

  try {
    raw = JSON.parse(json);
  } catch {
    return {
      ok: false as const,
      message: "File backup bukan JSON yang valid.",
    };
  }

  const result = DatabaseSchema.safeParse(raw);

  if (!result.success) {
    return {
      ok: false as const,
      message: "Struktur backup tidak sesuai skema.",
      issues: result.error.issues,
    };
  }

  return { ok: true as const, data: result.data };
}
```

**Penerapan produksi:** ganti `z.unknown()` dengan schema lengkap, validasi ID unik dan referensi antardata, terapkan migrasi `schemaVersion`, dan buat snapshot sebelum restore. Jangan mengubah database aktif jika salah satu pemeriksaan gagal.

### 5.2 Normalisasi dan pembentukan URL WhatsApp

```typescript
export function buildWhatsAppUrl(
  phone: string,
  message: string
): string {
  const digits = phone.replace(/\D/g, "");

  let normalized: string;

  if (digits.startsWith("62")) {
    normalized = digits;
  } else if (digits.startsWith("0")) {
    normalized = `62${digits.slice(1)}`;
  } else if (digits.startsWith("8")) {
    normalized = `62${digits}`;
  } else {
    throw new Error("Nomor WhatsApp tidak valid.");
  }

  if (!/^62\d{8,13}$/.test(normalized)) {
    throw new Error("Panjang nomor WhatsApp tidak valid.");
  }

  const query = new URLSearchParams({
    phone: normalized,
    text: message,
  });

  return `https://api.whatsapp.com/send?${query.toString()}`;
}
```

Gunakan satu helper dari seluruh komponen. URL yang valid hanya menandakan permintaan berbagi telah disiapkan, bukan bahwa pesan benar-benar terkirim.

### 5.3 Hasil integrasi yang membedakan simulasi

```typescript
type DeliveryResult =
  | { status: "sent"; messageId?: number }
  | { status: "simulated"; message: string }
  | { status: "queued"; eventId: string }
  | { status: "failed"; message: string };

function integrationNotConfigured(): DeliveryResult {
  return {
    status: "simulated",
    message: "Integrasi belum dikonfigurasi.",
  };
}
```

Gunakan tipe hasil ini di lapisan integrasi dan UI. Jangan menampilkan badge “terkirim” bila status hanya `simulated` atau `queued`. Pengiriman nyata harus diverifikasi melalui respons provider dan, bila diperlukan, status acknowledgment.

### 5.4 Contoh tes batas denda

```typescript
import { describe, expect, it } from "vitest";

describe("calculateLateMinutes", () => {
  const end = 1_800_000_000;

  it("returns zero when returned on time", () => {
    expect(calculateLateMinutes(end, end)).toBe(0);
  });

  it("rounds partial minutes upward", () => {
    expect(calculateLateMinutes(end, end + 61)).toBe(2);
  });

  it("returns 60 for exactly one hour late", () => {
    expect(calculateLateMinutes(end, end + 3600)).toBe(60);
  });
});
```

Tes ini hanya menguji konversi durasi. Tambahkan tes terpisah untuk setiap tier ShortRent, toleransi sewa harian/bulanan, dan nominal rupiah sesuai tabel kebijakan resmi.

---

## 6. Strategi Pengujian dan Kriteria Penerimaan

### Lapisan pengujian

1. **Unit test:** parser, transisi status, denda, tarif, normalisasi nomor, dan interval bentrok.
2. **Contract test:** seluruh 13 field harus konsisten antara form, kwitansi, pesan WhatsApp, dan ekspor.
3. **Integration test:** backup/restore, quota error, antrean Google Sheets, Telegram, dan retry.
4. **Concurrency test:** dua operator mencoba mengalokasikan unit yang sama pada waktu bersamaan.
5. **Device test:** Android PWA standalone, offline startup, safe area, keyboard virtual, dan update service worker.

### Kriteria penerimaan minimum

- Tidak ada dua booking yang berhasil mengunci unit yang sama pada rentang yang bertabrakan.
- Restore yang tidak valid tidak mengubah database aktif.
- Denda pada setiap batas waktu sesuai tabel kebijakan yang disahkan.
- Perubahan status booking dan posisi unit tidak meninggalkan kombinasi yang tidak valid.
- Integrasi simulasi tidak pernah dilaporkan sebagai pengiriman sukses.
- Semua field yang diwajibkan muncul konsisten pada output yang relevan.
- Secret tidak disimpan di browser storage atau disertakan dalam backup.
- Kegagalan persistensi ditampilkan dengan jelas dan tidak disamarkan sebagai sukses.

---

## 7. Roadmap Peningkatan

| Fase | Fokus | Hasil yang diharapkan |
|---|---|---|
| Fase 1 | Backup, validasi skema, aturan identitas dan denda | Data lebih aman dan tagihan konsisten |
| Fase 2 | Transaksi backend, locking, idempotensi | Risiko double-booking berkurang secara struktural |
| Fase 3 | Sinkronisasi armada, kurir, servis | Alur operasional konsisten |
| Fase 4 | Antrean integrasi, retry, observability | Kegagalan eksternal dapat dipantau dan dipulihkan |
| Fase 5 | Contract test dan UX Android | Form dan pengalaman pengguna lebih dapat diandalkan |

Urutan ini sebaiknya diubah hanya bila hasil analisis risiko operasional menunjukkan prioritas lain.

---

## 8. Kesimpulan Akhir

RyokoRent memiliki fondasi modular yang layak dipertahankan, tetapi sistem rental membutuhkan jaminan konsistensi yang lebih kuat daripada aplikasi pencatatan lokal biasa.

Prioritas tertinggi:

1. Perkuat validasi dan recovery data.
2. Tetapkan aturan resmi untuk identitas pendukung dan batas denda.
3. Jadikan alokasi booking operasi atomik di backend.
4. Jaga konsistensi status booking, armada, kurir, dan servis.
5. Perbaiki keamanan secret dan ketahanan integrasi eksternal.
6. Otomatiskan pengujian seluruh 13 field dan alur PWA Android.

**Batas audit:** dokumen ini merupakan review statis dan rencana peningkatan. Temuan harus diverifikasi melalui pengujian otomatis, pengujian multioperator, dan uji perangkat sebelum aplikasi dinyatakan siap produksi.
