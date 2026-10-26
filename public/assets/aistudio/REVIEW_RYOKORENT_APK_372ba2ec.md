# Review Kode & Arsitektur: RyokoRent Android APK (v3.2.2)

Tanggal review: 25 Oktober 2026

## Cakupan dan batasan

**Sudah dibaca penuh:** `bookingEngine.ts`, `ryoko.ts`, `storageService.ts`, `whatsappChatParser.ts`, `whatsappService.ts`, `countdownHelper.ts`, `BookingsView.tsx`, `NewBookingModal.tsx` (bagian logika), `googleSheetsService.ts`, `telegramBotService.ts`, `seedData.ts` (bagian data kunci), `App.tsx` (handler bisnis).

**Dipindai per pola, belum dibaca baris demi baris:** `CourierDashboardView.tsx`, `DigitalReceiptModal.tsx`, `CountdownAlertBanner.tsx`, `ActionModals.tsx`.

**Belum tersedia:** `SettingsView`, `FleetView`, `TrackingView`, `ServiceLogsView`, `DashboardView`, `UserManagementView`, `utils/clipboard`, `utils/markdownParser`. Klaim "lint 0 error, build sukses" di `SESSION_STATE.md` tidak bisa diverifikasi.

**Dibuktikan dengan eksekusi (zona waktu Asia/Jakarta):** bug #1, #2, #3, dan #4 di bagian Temuan Kritis.

---

## 1. Executive Summary

**Skor: 62/100.**

Fondasi sudah baik: tipe data jelas, engine bisnis berupa fungsi murni, snapshot booking, buffer 60 menit konsisten, dan logika step-up ShortRent masuk akal. Yang menurunkan skor:

1. Empat bug yang terbukti dan menyentuh jadwal serta uang (jam bergeser 7 jam, parser salah baca jam, epoch seed meleset 24 jam, fallback data contoh).
2. Arsitektur satu perangkat per LocalStorage tidak cocok dengan fitur multi-peran, Telegram, dan Google Sheets.
3. Integrasi Telegram dan Sheets belum benar-benar bekerja dua arah (tombol Telegram tidak punya penerima, webhook Sheets kemungkinan gagal CORS, antrean offline tidak pernah dikirim ulang).
4. Data pribadi pelanggan nyata ada di kode sumber (seed) dan mengalir ke Telegram, Sheets, dan berkas ekspor tanpa kebijakan retensi.
5. Tidak ada tes otomatis.

---

## 2. Kelebihan Arsitektur

- Engine bisnis (`bookingEngine`, `countdownHelper`) berupa fungsi murni, mudah diuji dan terpisah dari UI.
- `BookingRecord` menyimpan snapshot (`snapshotNamaMotor`, `snapshotKodeUnit`, `totalHargaEstimasi`), jadi riwayat tidak berubah saat master diedit.
- Cek bentrok memakai `max(bEnd, now)` untuk sewa berstatus `disewa`, sehingga unit yang telat tidak ditawarkan ke booking berikutnya.
- Approve dan Tukar Unit memakai `getAvailableUnitsForModel` dengan `excludeBookingId`, jadi tidak bentrok dengan dirinya sendiri.
- Tukar Unit mencatat riwayat (`riwayatTukarUnit`) dan memperbarui dua baris tracking sekaligus.
- Setiap aksi mutasi lewat satu pintu (`updateDatabaseState`), lengkap dengan audit log 50 entri.
- `encodeURIComponent` dipakai konsisten untuk teks dan nomor di URL WhatsApp, sehingga UTF-8 dan emoji aman.
- Skema `RyokoDatabase` (`motors → units → tracking`) mendukung armada yang bertambah tanpa batas (Q-02).

---

## 3. Temuan Kritis

### 3.1 Terbukti dengan eksekusi

| # | Temuan | Dampak |
| :-- | :--- | :--- |
| 1 | **Jam selesai bergeser 7 jam di WIB** (`NewBookingModal`). `toISOString()` (UTC) dipakai untuk input `datetime-local` (lokal). Default 09:00 tampil `02:00`, sewa 1 hari dari `2026-10-26T09:00` menjadi selesai `2026-10-27T02:00`. | Buffer, denda, countdown, dan harga durasi semuanya salah. |
| 2 | **Parser salah baca jam bertitik dua.** `"8. Jadwal mulai : 24 Oktober 15:40"` terbelah menjadi `[" 24 Oktober 15", "40"]`, teks yang dipakai `"40"`. Format `15.40` lolos, `15:40` gagal. | Tanggal gagal terbaca, lalu jatuh ke fallback tersembunyi (#3). |
| 3 | **Fallback parser berisi data contoh.** Tanggal `…-10-24`, jam `15:40`, `10-25 15:00`, motor `scoopy`, lokasi `Apartemen Begawan Malang` (data Ridho). | Parse gagal tetap menghasilkan booking yang tampak valid. |
| 4 | **Epoch seed meleset 24 jam** (23 jam untuk satu booking) dari string jamnya. Engine memakai `b.startEpoch \|\| parse(...)`, jadi epoch yang salah menang. | Countdown, denda, dan bentrok pada data seed salah sehari. Epoch dan string yang disimpan terpisah mudah tidak sinkron. |

### 3.2 Dari pembacaan kode

**Uang dan jadwal**

5. **Harga fallback hardcoded** di `NewBookingModal`: `harga1Bulan || 1750000`, paket promo `260000`, motor kosong `85000`. Seed memang mengisi `harga1Bulan` semua model, tetapi model baru atau hasil edit tanpa tarif bulanan ditagih Rp1.750.000 secara diam-diam.
6. **Denda memakai tarif master yang hidup** (`motor.dendaHarianPerJam`). Bulk pricing atau edit master mengubah denda booking yang sedang berjalan. Hapus model (App mengizinkan, hanya dengan `confirm`) membuat `BookingsView` jatuh ke `db.motors[0]` (tarif motor lain) atau crash bila daftar kosong.
7. **Tidak ada cek ulang saat submit.** `handleSubmit` mengunci `selectedUnitId` tanpa memanggil `isUnitAvailableForRange` lagi. Pilihan unit tidak direset saat jadwal atau model diubah (hanya parser yang mereset). Celah double-booking.
8. **`isUnitAvailableForRange` terlalu kasar.** Status `kurir` atau `servis` menolak semua tanggal, termasuk minggu depan setelah `estimasiSelesai`. `settings.turnaroundBufferMinutes` tidak dipakai; yang berlaku konstanta 3600.
9. **Penomoran dan id rawan tabrakan.** `generateBookingNumber` memakai jumlah hari ini + 1. `id: Date.now()`, unit `100 + units.length + 1`, servis `SRV-${count+1}` bisa kembar setelah ada penghapusan.
10. **Selisih ambang denda.** Harian: 60 menit gratis, 61 menit langsung dihitung 2 jam (`ceil(61/60)`). Kebijakan "toleransi dipotong dari hitungan" vs "tebing" perlu diputuskan.

**Konsistensi state**

11. **Approve tidak memperbarui tracking, tetapi jalur "kunci langsung" saat buat booking mengubah tracking menjadi `disewa`.** Unit tampil "disewa" saat booking baru `approved` dan unit masih di pool.
12. **Booking `approved` tidak bisa dibatalkan dari UI.** Tombol Tolak hanya muncul untuk `ryokou_booking`. Unit yang sudah terkunci tidak punya jalan keluar.
13. **Pembatalan = hapus permanen.** Tidak ada status `dibatalkan`, sehingga riwayat dan analisis hilang. Proteksi D-20 hanya memblokir `disewa`; handler tetap bisa menghapus booking `selesai` (data omset).
14. **Tukar Unit mengembalikan unit lama ke `parkir`** apa pun alasannya. Jika alasannya motor rusak, unit rusak itu langsung tersedia disewakan.
15. **Catat servis memaksa unit menjadi `servis`**, termasuk saat unit sedang `disewa`, dan juga untuk pencatatan servis lampau. Tidak ada validasi silang dengan booking aktif.
16. **`ryokou_diservis` tidak pernah dipakai.** Tidak ada handler di `App.tsx`, `ActionModals`, seed, atau Courier yang menetapkan status itu pada booking, dan `BookingsView` tidak punya filter atau aksi untuknya. Subjudul menyebut "4 Status", sedangkan BR-02 menyebut 5.
17. **`activeUser` jatuh ke administrator bawaan** (`Budi Santoso`) bila daftar pengguna kosong (fail-open). Pergantian pengguna tidak memakai PIN; RBAC hanya tampilan.

**Parser dan WhatsApp**

18. **Nomor WA dummy.** `normalizeWhatsAppNumber` mengembalikan `6281234567890` bila kosong, dan seed memakai nomor yang sama sebagai `adminWhatsapp`. Sebelum pengaturan diisi, data 13 poin terkirim ke nomor acak.
19. **Tombol "WA Penyewa" salah alamat.** Untuk status `booking` dan `selesai`, `BookingsView` memanggil `generateBookingConfirmationWhatsAppUrl(b, b.nomorWa)`, yang berbunyi "Halo Admin…", ke pelanggan.
20. **ID tak dikenal dipetakan ke `SIM_C`.** Template meminta "KTP", tetapi `SupportIdType` tidak punya `KTP`; parser juga tidak membaca "malam" dan label seperti "No HP".
21. **Teks pasti yang tidak mengikuti data.** Kwitansi selalu menulis "LUNAS" dan "diterima dalam kondisi baik"; helm dan STNK hardcoded; invoice bulanan menjanjikan "gratis ganti oli 1x" yang tidak ada di BLUEPRINT.

**Penyimpanan**

22. **`loadDatabase` menyuntik ulang booking seed** bila id atau nomornya tidak ada, jadi data yang sudah dihapus muncul kembali.
23. **`INITIAL_DATABASE` dikembalikan sebagai referensi.** `appendAuditLog` memutasi `settings` yang dibagi dengan konstanta seed, sehingga `resetDatabaseToDefault` tidak benar-benar mereset.
24. **Kegagalan simpan diam-diam.** `saveDatabase` hanya `console.error`. `importDatabaseJSON` menimpa tanpa cadangan dan tanpa migrasi.
25. **Kuota.** Perkiraan kasar ±1,5 KB per booking, sehingga 5 MB habis di kisaran 3.000 booking (sekitar setahun pada 10 booking/hari).

**Integrasi (berkas baru)**

26. **Tombol inline Telegram tidak punya penerima.** `executeTelegramActionCallback` tidak dipanggil dari berkas mana pun yang saya terima, dan aplikasi PWA offline tidak punya server atau polling `getUpdates`. Aksi "Selesai", "Perpanjang", dan "Denda" praktis tidak bisa dijalankan dari Telegram. Fungsinya juga bermasalah sendiri: memutasi objek langsung, menandai selesai tanpa membebaskan tracking, tanpa `actualReturnEpoch` (denda berisiko `NaN` karena `selesaiAt` berformat locale), dan memakai denda hardcoded Rp25.000 yang bertentangan dengan tarif master (Rp15.000–35.000).
27. **Pesan Telegram memakai `parse_mode: 'HTML'` tanpa escape.** Nama atau alamat berisi `<`, `>`, atau `&` membuat API menolak pesan. Tautan WA di tombol memakai `booking.nomorWa` mentah (tidak dinormalisasi) dan encoding sebagian. Pesan membawa kontak darurat dan alamat ke layanan pihak ketiga.
28. **Token bot ada di URL, dipanggil dari klien**, tersimpan di LocalStorage, dan ikut ekspor JSON.
29. **Webhook Sheets kemungkinan besar gagal dari browser.** `Content-Type: application/json` memicu preflight CORS, yang tidak dijawab Google Apps Script. Hasilnya `catch` lalu masuk antrean offline. Selain itu `fetch` tidak bisa membaca balasan lintas-origin dengan benar. Tidak ada autentikasi selain kerahasiaan URL.
30. **Antrean offline Sheets tidak pernah dikirim ulang.** Hanya `enqueue` dan `count` yang ada; tidak ada fungsi pengosongan antrean. Antrean dipotong ke 50 baris, tidak menghapus duplikat (mode simulasi menambah baris yang sama tiap sinkron), tidak dimasukkan ke ekspor/reset, dan menyimpan data pribadi tanpa retensi.
31. **Klaim "sinkronisasi dua arah" tidak terpenuhi.** Hanya ada UPSERT satu arah. Kolom Review/Opsi/Aksi dihitung ulang dari status booking tiap sinkron, jadi suntingan admin di Sheet akan tertimpa. Opsi untuk `ryokou_disewa` ("Tugaskan Kurir Antar") tidak masuk akal.
32. **Injeksi rumus CSV.** Nilai yang diawali `=`, `+`, `-`, `@` ditafsirkan sebagai rumus. `idSosmed` seperti `@ridhoxw` sendiri bisa terkena. Nomor darurat berawalan `0` kehilangan angka nol saat dibaca sebagai angka.

**Privasi dan operasional**

33. **Data pelanggan nyata di kode sumber.** `seedData.ts` berisi nama, nomor WA, nomor darurat, alamat KTP, dan akun sosial pelanggan Ridho, dan ikut ke bundel produksi.
34. **Bundel produksi memuat `SESSION_STATE.md`** (`import ... ?raw`), termasuk catatan internal dan nama repositori origin.
35. **Pengingat bergantung pada aplikasi terbuka.** `setInterval` ditangguhkan Android saat layar mati atau PWA di latar belakang. Tidak ada `Notification` atau push.
36. **Render per detik.** `BookingsView` memperbarui state tiap detik dan menghitung denda untuk seluruh daftar; Courier dan banner punya timer sendiri.
37. **Tes tidak ada.** BLUEPRINT §8 menyebut `calculateMonthlyTariff`, yang tidak ada di `bookingEngine.ts`.

---

## 4. Matriks Evaluasi Kepatuhan

| Item | Status | Catatan |
| :--- | :--- | :--- |
| BR-01 Tarif + 1 Bulan | Sebagian | Tipe dan UI ada; fallback harga hardcoded (#5) |
| BR-02 State machine 5 status | Sebagian | `diservis` tidak pernah dipakai (#16); approve vs tracking tidak konsisten (#11); approved tidak bisa dibatalkan (#12) |
| BR-03 Posisi unit | Sebagian | Tipe lengkap; `kurir`/`servis` memblokir semua tanggal (#8); catat servis menimpa `disewa` (#15) |
| BR-04 Buffer 60 mnt | Lulus | Konstanta 3600 detik benar; `turnaroundBufferMinutes` tidak dipakai |
| BR-05 Denda | Sebagian | Step-up benar; tebing 61 mnt (#10); tarif hidup (#6); denda Telegram hardcoded (#26) |
| BR-06 Tanpa NIK | Lulus | Tidak ada validasi pemblokir; `sanitizeTextNoNik` dan `containsNikPattern` tidak dipakai |
| BR-07 Tarif massal | Sebagian | Pembulatan ribuan benar di handler; efek retroaktif ke denda (#6) |
| BR-08 7 kategori servis | Sebagian | Tipe lengkap; efek samping ke tracking (#15); UI belum dilihat |
| D-20 proteksi hapus | Sebagian | Hanya `disewa`; hapus keras (#13) |
| 13 field: modal | Lulus | Semua poin ada |
| 13 field: parser | Sebagian | #2, #3, #20 |
| 13 field: kwitansi/WA/Sheets | Lulus | Terpetakan; teks hardcoded (#21) |
| Anti-NIK | Lulus | Tetapi alamat KTP dan kontak darurat keluar ke Telegram/Sheets (#27, #33) |
| Integrasi WhatsApp | Sebagian | Encoding benar; nomor dummy (#18); salah alamat (#19) |
| Integrasi Google Sheets | Belum siap | #29–#32 |
| Integrasi Telegram | Belum siap | #26–#28 |

Catatan: bila keputusan pemilik di proyek website (overtime Rp10.000/jam, jeda antar-sewa 90 menit, toleransi dipotong dari hitungan) juga berlaku di APK ini, ada selisih dengan default di sini (Rp20.000/jam, buffer 60 menit, toleransi sebagai ambang).

---

## 5. Rekomendasi Terprioritas

### P0: integritas data dan uang

1. Perbaiki zona waktu input (#1) dan simpan semua waktu sebagai epoch angka; turunkan string dari epoch, bukan sebaliknya (#4).
2. Perbaiki `split` parser dan hapus semua fallback data contoh; bila gagal, kosongkan kolom dan tampilkan peringatan (#2, #3).
3. Hapus harga hardcoded dan wajibkan tarif terisi (#5).
4. Hapus nomor WA dummy dan nomor bawaan `adminWhatsapp`; blokir tombol WA bila nomor kosong (#18).
5. Pisahkan template admin dan template pelanggan (#19).
6. Validasi ulang unit dan jadwal saat submit, terhadap state terbaru (#7).
7. Keluarkan data pelanggan nyata dari `seedData.ts` dan hentikan penyuntikan ulang seed (#22, #33).
8. Tampilkan error bila simpan gagal, cadangkan otomatis sebelum import (#24).
9. Keluarkan token dan webhook dari ekspor JSON (#28).
10. Matikan atau tandai "belum aktif" tombol aksi Telegram sampai penerima callback ada (#26).

### P1: operasional

1. Snapshot tarif denda ke booking saat dibuat (#6); cegah hapus model yang masih punya unit atau booking.
2. Konsistenkan tracking untuk approve dan kunci langsung; tambah aksi batal untuk `approved` dan status `dibatalkan` sebagai pengganti hapus keras (#11–#13).
3. Tukar Unit: beri pilihan nasib unit lama (`parkir`/`servis`) (#14); catat servis: tolak bila unit sedang `disewa` (#15).
4. Putuskan nasib `ryokou_diservis` (hapus dari status booking atau beri alur) (#16).
5. Batasi blokir `kurir`/`servis` sampai `estimasiSelesai` (#8); pakai `turnaroundBufferMinutes`.
6. Id dan nomor: gunakan nilai maksimum atau `crypto.randomUUID()` (#9).
7. Tambahkan PIN peralihan peran dan ubah fallback pengguna menjadi akses terkecil (#17).
8. Telegram: escape HTML, normalisasi nomor, jalankan callback lewat backend kecil atau tinggalkan tombol inline (#26, #27).
9. Sheets: kirim `text/plain` atau gunakan `no-cors` bersama Apps Script, tambahkan token rahasia, buat fungsi pengosongan antrean dengan deduplikasi `noBooking`, dan bersihkan sel rumus (#29–#32).
10. Retensi data pribadi: hapus ID, alamat KTP, dan kontak darurat N hari setelah unit kembali (bila kebijakan 3 hari dari proyek website berlaku, terapkan juga di sini), termasuk di antrean Sheets.
11. Pindah ke IndexedDB atau arsipkan per bulan (#25).
12. Satukan ticker, memoisasi daftar (#36), dan putuskan apakah butuh push/server untuk alert latar belakang (#35).
13. Keluarkan `SESSION_STATE.md` dari bundel produksi (#34).
14. Tulis tes unit (≥15 kasus) untuk `calculateOvertimePenalty`, `isUnitAvailableForRange`, parser, dan konsistensi epoch (#37).

### P2: UX dan penyempurnaan

- Target sentuh tombol aksi (`py-1.5 text-xs`, ±28–32 px) naikkan ke ≥44 px untuk satu tangan.
- Kontras `text-slate-500` pada `slate-900` dan `text-[10px]` rendah di bawah cahaya matahari.
- Format tanggal: simpan ISO, tampilkan lewat formatter (bukan string locale).
- Samakan label status ("4. Selesai" vs "05"), tambahkan filter Diservis bila status dipertahankan.
- Ganti `alert`/`confirm` bawaan dengan modal konsisten; `window.print` bukan PDF sungguhan, beri tahu operator.
- Pastikan `scrollbar-none` dan `animate-fadeIn` benar-benar terdefinisi di Tailwind v4.
- Template WA pakai nama merek yang sama (Ryoko Rent vs Ryokourent) dan jumlah helm sesuai data.

---

## 6. Cuplikan Kode Rekomendasi

### 6.1 Input waktu lokal dan penjaga saat submit (`NewBookingModal`)

```ts
const pad = (n: number) => String(n).padStart(2, '0');
export const toLocalInput = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

// default dan handleDurationChange:
// setJamTanggalSelesai(toLocalInput(new Date(startDate.getTime() + hoursToAdd * 3600e3)));

// handleSubmit:
if (endEpoch <= startEpoch) return alert('Jadwal selesai harus setelah jadwal mulai.');
if (chosenUnit && !isUnitAvailableForRange(chosenUnit.id, startEpoch, endEpoch, db)) {
  return alert(`Unit ${chosenUnit.kodeUnit} bentrok dengan jadwal lain. Pilih unit lain.`);
}
```

### 6.2 Parser: nilai setelah titik dua pertama, tanpa fallback palsu

```ts
const valueAfterColon = (line: string) => {
  const i = line.indexOf(':');
  return i === -1 ? '' : line.slice(i + 1).trim();
};

// cabang 8 (jadwal mulai):
const text = valueAfterColon(line);            // "24 Oktober 15:40"
startDateRaw = text;
const t = text.match(/\b\d{1,2}[.:]\d{2}\b/);
if (t) startTimeRaw = t[0];

// akhir fungsi: jangan isi data contoh
const warnings: string[] = [];
const parsedStartDate = parseIndonesianDate(startDateRaw, currentYear);
if (!parsedStartDate) warnings.push('Tanggal mulai tidak terbaca');
// kembalikan { ..., warnings } dan biarkan kolom kosong bila gagal
```

### 6.3 Denda aman dan tarif dari snapshot

```ts
if (!Number.isFinite(endEpoch) || !Number.isFinite(returnEpoch) || endEpoch <= 0) {
  return {
    terlambat: false, menitTelat: 0, nominalDenda: 0,
    dendaFormat: 'Waktu tidak valid',
    keterangan: 'Cek jadwal selesai / waktu kembali.',
  };
}
const dendaHarian = booking.dendaHarianPerJamSnapshot ?? motor?.dendaHarianPerJam;
if (!dendaHarian) throw new Error('Tarif denda belum diatur');
```

### 6.4 Nomor WA tanpa dummy

```ts
export function normalizeWhatsAppNumber(phone: string): string | null {
  const d = (phone || '').replace(/\D/g, '');
  if (d.length < 8) return null;
  if (d.startsWith('0')) return '62' + d.slice(1);
  return d.startsWith('62') ? d : '62' + d;
}
// pemanggil: bila null, tampilkan "Nomor WA belum diisi" dan jangan buka tautan
```

### 6.5 Escape HTML untuk Telegram

```ts
const esc = (s: string) =>
  String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// contoh: 👤 <b>Penyewa:</b> ${esc(booking.nama)}
```

### 6.6 CSV: netralkan rumus

```ts
const escapeCell = (val: unknown): string => {
  let s = val == null ? '' : String(val);
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;   // cegah injeksi rumus
  return `"${s.replace(/"/g, '""')}"`;
};
```

### 6.7 Webhook Apps Script tanpa preflight

```ts
const res = await fetch(webhookUrl.trim(), {
  method: 'POST',
  headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // tanpa preflight
  body: JSON.stringify({ action: 'UPSERT_BOOKING', token: secretToken, data: row }),
});
// di sisi Apps Script: JSON.parse(e.postData.contents), cek token, balas ContentService JSON
```

### 6.8 Antrean offline: deduplikasi dan pengosongan

```ts
export function enqueueOfflineSheetsSync(row: GoogleSheetsRowData) {
  const queue: GoogleSheetsRowData[] = JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || '[]');
  const next = queue.filter(r => r.noBooking !== row.noBooking).concat(row); // upsert lokal
  localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(next));              // jangan buang diam-diam
}

export async function flushOfflineSheetsQueue(webhookUrl: string) {
  const queue: GoogleSheetsRowData[] = JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || '[]');
  const failed: GoogleSheetsRowData[] = [];
  for (const row of queue) {
    try { await postRow(webhookUrl, row); } catch { failed.push(row); }
  }
  localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(failed));
}
```

### 6.9 Batal booking tanpa hapus keras

```ts
// ryoko.ts: tambahkan 'ryokou_dibatalkan' ke BookingStatus, lalu di handler:
if (['ryokou_disewa', 'ryokou_selesai'].includes(target.status)) {
  alert('Transaksi disewa/selesai tidak boleh dibatalkan.');
  return;
}
const updated = db.bookings.map(b =>
  b.id === bookingId ? { ...b, status: 'ryokou_dibatalkan' as const } : b
);
// bebaskan tracking seperti sebelumnya; tampilkan tombol Batal juga untuk 'ryokou_approved'
```

### 6.10 Salin seed agar tidak termutasi

```ts
export function resetDatabaseToDefault(): RyokoDatabase {
  const fresh = structuredClone(INITIAL_DATABASE);
  saveDatabase(fresh);
  return fresh;
}
// dan hentikan penyuntikan booking seed di loadDatabase()
```

---

## Ringkasan urutan kerja yang disarankan

1. **Hari ini:** #1, #2, #3, #18, #19, dan hapus data pelanggan nyata dari seed.
2. **Minggu ini:** validasi submit (#7), bug Tukar Unit/servis/batal (#12–#15), cadangan sebelum import, matikan tombol Telegram yang belum berfungsi.
3. **Bulan ini:** tes unit, kebijakan retensi, IndexedDB, perbaikan Sheets, dan keputusan arsitektur (satu perangkat atau butuh sinkronisasi/server kecil).
