#!/usr/bin/env bash
# ==============================================================================
# RyokoRent Android APK Generator (Bubblewrap TWA Helper)
# Versi Aplikasi: 3.5.0 | ZLCE: v3.2.2
# ==============================================================================

set -e

APP_URL="${1:-https://ais-pre-5fmxofm7zgewkvnw7msoyv-947129619991.asia-southeast1.run.app}"
MANIFEST_URL="${APP_URL%/}/manifest.webmanifest"
BUILD_DIR="android-build"

echo "================================================================="
echo "   RyokoRent Android APK Generator (Bubblewrap TWA)"
echo "================================================================="
echo "Target URL:   $APP_URL"
echo "Manifest URL: $MANIFEST_URL"
echo "Output Dir:   $BUILD_DIR"
echo "-----------------------------------------------------------------"

# 1. Cek instalasi bubblewrap CLI
if ! command -v bubblewrap &> /dev/null; then
    echo "[!] Google Bubblewrap CLI belum terpasang."
    echo "    Memasang Bubblewrap via npm..."
    npm install -g @bubblewrap/cli || {
        echo "[x] Gagal memasang Bubblewrap. Silakan jalankan: npm install -g @bubblewrap/cli"
        exit 1
    }
fi

echo "[✓] Bubblewrap CLI terdeteksi: $(bubblewrap --version 2>/dev/null || echo 'terpasang')"

# 2. Siapkan direktori build
mkdir -p "$BUILD_DIR"
cd "$BUILD_DIR"

# 3. Inisialisasi TWA project jika belum ada
if [ ! -f "twa-manifest.json" ]; then
    echo "[*] Menginisialisasi proyek TWA dari manifest..."
    bubblewrap init --manifest="$MANIFEST_URL"
else
    echo "[*] twa-manifest.json sudah ada, melanjutkan build..."
fi

# 4. Bangun berkas APK
echo "[*] Membangun berkas Android APK..."
bubblewrap build

echo "-----------------------------------------------------------------"
echo "[✓] Berkas APK berhasil dibuat di dalam folder: $BUILD_DIR"
echo "    - app-release-signed.apk (Siap pasang di ponsel Android)"
echo "================================================================="
