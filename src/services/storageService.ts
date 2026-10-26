import { RyokoDatabase, AuditLogItem } from '../types/ryoko';
import { INITIAL_DATABASE } from '../data/seedData';

export const STORAGE_KEY = 'ryokourent_db_v1';

export type SaveResult = { ok: true } | { ok: false; message: string };

/**
 * Fungsi migrasi skema tunggal (Single Source of Migration Truth)
 * Memastikan semua field, default value, dan konversi format schema versi lama
 * terpenuhi secara konsisten saat loadDatabase maupun importDatabaseJSON.
 */
export function migrateDatabase(rawDb: unknown): RyokoDatabase {
  const initial = structuredClone(INITIAL_DATABASE);
  if (!rawDb || typeof rawDb !== 'object') {
    return initial;
  }

  const db = rawDb as Partial<RyokoDatabase>;

  // Check required collections
  const motors = Array.isArray(db.motors) && db.motors.length > 0 ? db.motors : initial.motors;
  const units = Array.isArray(db.units) && db.units.length > 0 ? db.units : initial.units;
  const bookings = Array.isArray(db.bookings) ? db.bookings : initial.bookings;
  const packages = Array.isArray(db.packages) && db.packages.length > 0 ? db.packages : initial.packages;
  const tracking = Array.isArray(db.tracking) ? db.tracking : initial.tracking;

  // Settings
  const settings = {
    ...initial.settings,
    ...(db.settings || {}),
  };

  // Service records
  const serviceRecords = Array.isArray(db.serviceRecords) ? db.serviceRecords : (initial.serviceRecords || []);

  // Daily operational logs
  const dailyOperationalLogs = Array.isArray(db.dailyOperationalLogs) ? db.dailyOperationalLogs : (initial.dailyOperationalLogs || []);

  // Users & current user
  const users = Array.isArray(db.users) && db.users.length > 0 ? db.users : (initial.users || []);
  const currentUserId = typeof db.currentUserId === 'string' && db.currentUserId ? db.currentUserId : (initial.currentUserId || 'usr-admin');

  // Ensure monthly price exists for motor models (migration from older schemas)
  const migratedMotors = motors.map(m => {
    if ((m as unknown as { harga2Minggu?: number }).harga2Minggu && !m.harga1Bulan) {
      return {
        ...m,
        harga1Bulan: Math.round(((m.harga1Hari || 85000) * 22) / 1000) * 1000,
      };
    }
    return m;
  });

  return {
    version: db.version || initial.version || '1.0.0',
    motors: migratedMotors,
    units,
    bookings,
    packages,
    tracking,
    settings,
    serviceRecords,
    dailyOperationalLogs,
    users,
    currentUserId,
    lastUpdated: db.lastUpdated || new Date().toISOString(),
  };
}

export function loadDatabase(): RyokoDatabase {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = structuredClone(INITIAL_DATABASE);
      saveDatabase(initial);
      return initial;
    }
    const parsed = JSON.parse(raw) as unknown;
    return migrateDatabase(parsed);
  } catch (error) {
    console.error('Failed to load database from LocalStorage:', error);
    // Simpan data mentah korup ke key cadangan darurat agar tidak terhapus permanen
    if (raw) {
      try {
        const corruptKey = `ryokourent_db_corrupt_${Date.now()}`;
        localStorage.setItem(corruptKey, raw);
        console.warn(`Data mentah korup dicadangkan ke LocalStorage key: ${corruptKey}`);
      } catch (backupErr) {
        console.error('Gagal mencadangkan data korup:', backupErr);
      }
    }
    const fallback = structuredClone(INITIAL_DATABASE);
    saveDatabase(fallback);
    return fallback;
  }
}

/**
 * Menyimpan database ke LocalStorage dengan pelaporan status kuota (Snippet E - F-12)
 */
export function saveDatabase(db: RyokoDatabase): SaveResult {
  try {
    db.lastUpdated = new Date().toISOString();
    const serialized = JSON.stringify(db);
    localStorage.setItem(STORAGE_KEY, serialized);
    return { ok: true };
  } catch (error) {
    const isQuota =
      error instanceof DOMException &&
      (error.name === 'QuotaExceededError' || error.code === 22);
    const message = isQuota
      ? 'Kapasitas LocalStorage browser penuh. Segera ekspor backup JSON dan bersihkan riwayat log.'
      : 'Gagal menyimpan database ke LocalStorage.';
    console.error(message, error);
    return { ok: false, message };
  }
}

export function resetDatabaseToDefault(): RyokoDatabase {
  const cloned = structuredClone(INITIAL_DATABASE);
  saveDatabase(cloned);
  return cloned;
}

/**
 * Ekspor database ke JSON dengan opsi menyembunyikan token rahasia (Snippet E - F-13)
 */
export function exportDatabaseJSON(includeSecrets = false): string {
  const db = loadDatabase();
  const { telegramBotToken, googleSheetsWebhookUrl, ...safeSettings } = db.settings;
  const settings = includeSecrets
    ? db.settings
    : { ...safeSettings, telegramBotToken: '', googleSheetsWebhookUrl: '' };
  return JSON.stringify({ ...db, settings }, null, 2);
}

/**
 * Impor database dari string JSON dengan validasi skema, auto-snapshot, dan migrasi terpadu (F-19)
 */
export function importDatabaseJSON(jsonStr: string): { success: boolean; message: string; db?: RyokoDatabase } {
  try {
    const parsed = JSON.parse(jsonStr) as unknown;
    if (!parsed || typeof parsed !== 'object') {
      return { success: false, message: 'Format file JSON tidak valid untuk database RyokoRent.' };
    }
    const dbObj = parsed as Partial<RyokoDatabase>;
    if (!dbObj.motors && !dbObj.units && !dbObj.bookings) {
      return { success: false, message: 'Format file JSON tidak memiliki struktur database RyokoRent yang sesuai.' };
    }

    // Auto-Snapshot database berjalan sebelum menimpa data baru
    try {
      const currentRaw = localStorage.getItem(STORAGE_KEY);
      if (currentRaw) {
        const snapshotKey = `ryokourent_snapshot_${Date.now()}`;
        localStorage.setItem(snapshotKey, currentRaw);
        console.info(`Auto-snapshot database dibuat sebelum restore: ${snapshotKey}`);
      }
    } catch (snapErr) {
      console.warn('Gagal membuat auto-snapshot sebelum restore:', snapErr);
    }

    const migrated = migrateDatabase(parsed);
    migrated.lastUpdated = new Date().toISOString();
    const result = saveDatabase(migrated);
    if (!result.ok) {
      return { success: false, message: result.message };
    }
    return { success: true, message: 'Database berhasil dipulihkan dari file cadangan.', db: migrated };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Kesalahan parsing JSON';
    return { success: false, message: `Gagal memulihkan database: ${errorMsg}` };
  }
}

export function getStorageUsage(): { bytes: number; kb: number; percentEstimate: number } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || '';
    const bytes = new Blob([raw]).size;
    const kb = Math.round((bytes / 1024) * 10) / 10;
    // Typical LocalStorage limit is 5MB
    const percentEstimate = Math.min(100, Math.round((bytes / (5 * 1024 * 1024)) * 1000) / 10);
    return { bytes, kb, percentEstimate };
  } catch {
    return { bytes: 0, kb: 0, percentEstimate: 0 };
  }
}

export function appendAuditLog(db: RyokoDatabase, aktivitas: string, detail: string): RyokoDatabase {
  const now = new Date();
  const timeStr =
    now.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }) +
    ' ' +
    now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) +
    ' WIB';

  const newLog: AuditLogItem = {
    id: `aud-${Date.now().toString(36)}`,
    waktu: timeStr,
    user: db.settings.operatorName || 'Operator Ryoko',
    aktivitas,
    detail,
  };

  const updatedLogs = [newLog, ...(db.settings.auditLogs || [])].slice(0, 100);
  return {
    ...db,
    settings: {
      ...db.settings,
      auditLogs: updatedLogs,
    },
  };
}
