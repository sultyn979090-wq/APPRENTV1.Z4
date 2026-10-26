/**
 * Suite Pengujian Unit Logika Bisnis & Integritas Data RyokoRent
 * Diuji menggunakan tsx runner
 * Mencakup 7 kasus uji kritis TASK-031 (Butir A2)
 */

import {
  calculateDynamicRentalTariff,
  checkTransition,
  NEXT_STATUS_TRANSITIONS,
  parseWibToEpoch,
  epochToWibInput,
  isUnitAvailableForRange,
} from '../src/services/bookingEngine';
import {
  loadDatabase,
  saveDatabase,
  importDatabaseJSON,
  STORAGE_KEY,
} from '../src/services/storageService';
import {
  normalizeWhatsAppNumber,
  generateWhatsAppLink,
} from '../src/services/whatsappService';
import {
  normalizeTimeInput,
  validYmd,
} from '../src/utils/whatsappChatParser';
import { INITIAL_DATABASE } from '../src/data/seedData';
import { MotorModel, BookingRecord, RyokoDatabase } from '../src/types/ryoko';

// Polyfill LocalStorage untuk runtime Node.js
if (typeof globalThis.localStorage === 'undefined' || !globalThis.localStorage) {
  const store = new Map<string, string>();
  globalThis.localStorage = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => store.set(key, String(value)),
    removeItem: (key: string) => store.delete(key),
    clear: () => store.clear(),
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    get length() {
      return store.size;
    },
  } as unknown as Storage;
}

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✓ [PASS] ${testName}`);
    passed++;
  } else {
    console.error(`  ✗ [FAIL] ${testName}${detail ? ` (${detail})` : ''}`);
    failed++;
  }
}

console.log('====================================================');
console.log('RYOKORENT LOGIC TEST SUITE (7 KASUS KRITIS TSX)');
console.log('====================================================\n');

// -------------------------------------------------------------------
// KASUS 1: F-03 P0 Deal Awal Tarif Harian Murni (8 Hari Tetap 8x Harian)
// -------------------------------------------------------------------
console.log('Kasus 1: Aturan Tarif Deal Awal Harian (F-03 P0)');
{
  const motor: MotorModel = {
    id: 1,
    namaModel: 'Honda Beat Street',
    kategori: 'Matic',
    harga1Hari: 85000,
    harga1Minggu: 500000,
    harga1Bulan: 1750000,
    harga3Jam: 45000,
    harga6Jam: 60000,
    harga9Jam: 75000,
    harga12Jam: 85000,
    dendaHarianPerJam: 20000,
    fasilitas: '2 Helm SNI, Jas Hujan',
    spesifikasi: '110cc ESP',
    isActive: true,
  };

  const start = 1700000000;
  const end8Days = start + 8 * 24 * 3600; // 8 hari penuh

  // Deal awal = 1_hari
  const res = calculateDynamicRentalTariff(motor, 'harian', '1_hari', start, end8Days);
  assert(
    res.totalHarga === 8 * 85000,
    'Sewa 8 hari paket 1_hari dihitung murni 8x tarif harian (Rp 680.000)',
    `Actual: ${res.totalHarga}`
  );
  assert(
    res.totalHarga !== 500000 + 85000,
    'Sistem TIDAK mengonversi sepihak ke paket mingguan + 1 hari (Rp 585.000)',
    `Actual: ${res.totalHarga}`
  );
}

// -------------------------------------------------------------------
// KASUS 2: BR-02 Status Unit Fisik Parkir Saat Pembuatan Booking Baru
// -------------------------------------------------------------------
console.log('\nKasus 2: Status Unit Parkir Saat Alokasi Booking Baru (BR-02)');
{
  const db: RyokoDatabase = structuredClone(INITIAL_DATABASE);
  const unit1 = db.units[0];
  const track1 = db.tracking.find(t => t.unitId === unit1.id);

  assert(
    track1 !== undefined && track1.statusPosisi === 'parkir',
    'Unit fisik garasi di database awal berstatus posisi parkir',
    `Status: ${track1?.statusPosisi}`
  );

  const start = 1700000000;
  const end = start + 24 * 3600;
  const available = isUnitAvailableForRange(unit1.id, start, end, db);
  assert(
    available === true,
    'Unit parkir tersedia untuk dialokasikan pada rentang waktu sewa baru'
  );
}

// -------------------------------------------------------------------
// KASUS 3: BR-02 Soft Cancel (ryokou_dibatalkan) State Machine Transitions
// -------------------------------------------------------------------
console.log('\nKasus 3: Soft Cancel State Machine ryokou_dibatalkan (BR-02)');
{
  assert(
    NEXT_STATUS_TRANSITIONS['ryokou_booking'].includes('ryokou_dibatalkan'),
    'Transisi ryokou_booking -> ryokou_dibatalkan diizinkan dalam matriks'
  );
  assert(
    NEXT_STATUS_TRANSITIONS['ryokou_approved'].includes('ryokou_dibatalkan'),
    'Transisi ryokou_approved -> ryokou_dibatalkan diizinkan dalam matriks'
  );

  const mockBooking: BookingRecord = {
    id: 999,
    noBooking: 'RYK-TEST-001',
    nama: 'Penyewa Batal',
    nomorWa: '08123456789',
    jenisIdPendukung: 'SIM_C',
    tandaPelanggan: 'baru',
    motorId: 1,
    snapshotNamaMotor: 'Honda Beat Street',
    unitId: 1,
    snapshotKodeUnit: 'BST-01',
    status: 'ryokou_booking',
    jamTanggalMulai: '2026-10-24T10:00',
    jamTanggalSelesai: '2026-10-25T10:00',
    startEpoch: 1700000000,
    endEpoch: 1700086400,
    totalHargaEstimasi: 85000,
    pool: 'malang',
    alamatPengantaran: 'Pool Malang',
    alamatPenjemputan: 'Pool Malang',
    jumlahHelm: 2,
    pilihanDurasi: '1_hari',
    kategoriTarif: 'harian',
    labelDurasi: '1 Hari (24 Jam)',
    luarJamOperasional: false,
    createdAt: '2026-10-24T09:00:00Z',
    dendaNominal: 0,
    dendaKeterangan: '-',
  };

  const db: RyokoDatabase = structuredClone(INITIAL_DATABASE);
  const err = checkTransition(mockBooking, 'ryokou_dibatalkan', db, 1);
  assert(
    err === null,
    'checkTransition mengembalikan null (sah) untuk pembatalan pemesanan booking'
  );
}

// -------------------------------------------------------------------
// KASUS 4: F-18 Proteksi & Cadangan Database LocalStorage Korup
// -------------------------------------------------------------------
console.log('\nKasus 4: Proteksi & Cadangan Database Korup (F-18)');
{
  localStorage.clear();
  const corruptRaw = '{ corrupt_json_format_tidak_valid: true, ... ';
  localStorage.setItem(STORAGE_KEY, corruptRaw);

  const recoveredDb = loadDatabase();
  assert(
    recoveredDb !== null && Array.isArray(recoveredDb.units),
    'loadDatabase tidak crash saat membaca data korup dan mengembalikan fallback database'
  );

  // Periksa apakah key cadangan korup terbuat
  let foundCorruptKey = false;
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith('ryokourent_db_corrupt_')) {
      foundCorruptKey = true;
      assert(
        localStorage.getItem(k) === corruptRaw,
        'Key cadangan darurat menyimpan persis string mentah korup yang gagal di-parse'
      );
      break;
    }
  }
  assert(foundCorruptKey, 'Ditemukan key pencadangan otomatis ryokourent_db_corrupt_<timestamp>');
}

// -------------------------------------------------------------------
// KASUS 5: F-19 Auto-Snapshot Database Sebelum Impor / Restore
// -------------------------------------------------------------------
console.log('\nKasus 5: Auto-Snapshot Sebelum Impor Database (F-19)');
{
  localStorage.clear();
  const initialDb = structuredClone(INITIAL_DATABASE);
  saveDatabase(initialDb);

  const validImportJson = JSON.stringify({
    version: '1.0.0',
    motors: initialDb.motors,
    units: initialDb.units,
    bookings: [],
  });

  const res = importDatabaseJSON(validImportJson);
  assert(res.success === true, 'importDatabaseJSON berhasil memulihkan database valid');

  let foundSnapshotKey = false;
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith('ryokourent_snapshot_')) {
      foundSnapshotKey = true;
      break;
    }
  }
  assert(foundSnapshotKey, 'Auto-snapshot ryokourent_snapshot_<timestamp> berhasil dibuat sebelum penimpaan');
}

// -------------------------------------------------------------------
// KASUS 6: TASK-027 Normalizer Input Jam & Tanggal WIB Bebas Format
// -------------------------------------------------------------------
console.log('\nKasus 6: Normalisasi Input Jam & Tanggal WIB (TASK-027)');
{
  assert(normalizeTimeInput('4') === '04:00', 'Normalisasi "4" -> "04:00"');
  assert(normalizeTimeInput('4.00') === '04:00', 'Normalisasi "4.00" -> "04:00"');
  assert(normalizeTimeInput('4,00') === '04:00', 'Normalisasi "4,00" -> "04:00"');
  assert(normalizeTimeInput('16.00') === '16:00', 'Normalisasi "16.00" -> "16:00"');
  assert(normalizeTimeInput('09:30') === '09:30', 'Normalisasi "09:30" -> "09:30"');

  assert(validYmd(2026, 10, 24) === '2026-10-24', 'Validasi tanggal kalender nyata valid');
  assert(validYmd(2026, 2, 31) === null, 'Tanggal invalid 31 Februari ditolak (null)');

  const epoch = parseWibToEpoch('2026-10-24T10:00');
  const wibOutput = epochToWibInput(epoch);
  assert(wibOutput === '2026-10-24T10:00', `epochToWibInput mempertahankan waktu WIB (+07:00): ${wibOutput}`);
}

// -------------------------------------------------------------------
// KASUS 7: F-20 Generator WhatsApp Jujur Tanpa Nomor Dummy
// -------------------------------------------------------------------
console.log('\nKasus 7: Tautan WhatsApp Jujur Tanpa Nomor Dummy (F-20)');
{
  assert(normalizeWhatsAppNumber('') === '', 'normalizeWhatsAppNumber nomor kosong menghasilkan string kosong');
  assert(normalizeWhatsAppNumber('08123456789') === '628123456789', 'Konversi nomor HP lokal 08xxx -> 628xxx');

  const textOnlyLink = generateWhatsAppLink('', 'Konfirmasi Booking RyokoRent');
  assert(
    !textOnlyLink.includes('6281234567890'),
    'generateWhatsAppLink nomor kosong TIDAK menyertakan dummy 6281234567890'
  );
  assert(
    textOnlyLink.startsWith('https://api.whatsapp.com/send?text='),
    'generateWhatsAppLink nomor kosong menghasilkan format link text-only share jujur'
  );

  const phoneLink = generateWhatsAppLink('08123456789', 'Halo Ryoko');
  assert(
    phoneLink.includes('phone=628123456789'),
    'generateWhatsAppLink dengan nomor menyertakan parameter phone internasional'
  );
}

console.log('\n====================================================');
console.log(`HASIL PENGUJIAN: ${passed} PASSED, ${failed} FAILED`);
console.log('====================================================');

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
