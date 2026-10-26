#!/usr/bin/env python3
"""ZLCE Kit Bundler.

Membangun dan memvalidasi berkas bundel tunggal zlce-kit/ZLCE_KIT_SINGLE.md
dari berkas-berkas template dan prompt penyusun di direktori zlce-kit/.

Usage:
  python3 scripts/zlce/zlce-bundle.py           # Menghasilkan / menimpa ZLCE_KIT_SINGLE.md
  python3 scripts/zlce/zlce-bundle.py --check   # Validasi apakah ZLCE_KIT_SINGLE.md sinkron (exit 0/1)
"""

import os
import sys

FILES_TO_BUNDLE = [
    ("LANDING_PROMPT.md", os.path.join("zlce-kit", "LANDING_PROMPT.md")),
    ("HANDOVER.md", "HANDOVER.md"),
    ("templates/AI_WORKFLOW.template.md", os.path.join("zlce-kit", "templates", "AI_WORKFLOW.template.md")),
    ("templates/BLUEPRINT.template.md", os.path.join("zlce-kit", "templates", "BLUEPRINT.template.md")),
    ("templates/FULL_MODE.template.md", os.path.join("zlce-kit", "templates", "FULL_MODE.template.md")),
    ("templates/TASKS.template.md", os.path.join("zlce-kit", "templates", "TASKS.template.md")),
    ("templates/SESSION_STATE.template.md", os.path.join("zlce-kit", "templates", "SESSION_STATE.template.md")),
    ("templates/CHANGELOG.template.md", os.path.join("zlce-kit", "templates", "CHANGELOG.template.md")),
    ("templates/profiles/DOMAIN_BOOKING.profile.md", os.path.join("zlce-kit", "templates", "profiles", "DOMAIN_BOOKING.profile.md")),
]


def generate_bundle(root_dir: str) -> str:
    lines = [
        "# ZLCE KIT (SATU BERKAS) v3.3.0",
        "",
        "Berkas ini adalah bundel tunggal (*monolithic bundle*) resmi Zero-Loss Context Engineering (ZLCE) v3.3.0.",
        "Tujuan Utama: Memungkinkan pemakaian ZLCE pada AI berbasis chat/web prompt tunggal (seperti ChatGPT, Claude Web, atau IDE prompt) yang tidak mendukung upload direktori folder sekaligus.",
        "",
        "Setiap berkas di dalamnya dibatasi penanda:",
        "<<<FILE: path>>> dan <<<END FILE>>>.",
        "Perlakukan tiap bagian sebagai berkas terpisah dengan path tersebut.",
        "",
        "💡 PRINSIP ARSITEKTUR DISTRIBUSI TEMPLATE:",
        "Kit ZLCE didistribusikan dalam wujud fungsional:",
        "1. `zlce-kit/templates/*.md`: Berkas template modular untuk repositori Git & IDE AI modular.",
        "2. `zlce-kit/ZLCE_KIT_SINGLE.md`: Bundel tunggal mandiri untuk AI berbasis prompt tunggal.",
        "3. Tab Recovery ZLCE Studio: Antarmuka pemulihan dan wizard serah terima di sisi klien.",
        "",
        "DAFTAR BERKAS:",
    ]

    for display_path, _ in FILES_TO_BUNDLE:
        lines.append(f"- {display_path}")

    lines.append("")

    for display_path, rel_path in FILES_TO_BUNDLE:
        full_path = os.path.join(root_dir, rel_path)
        if not os.path.exists(full_path):
            raise FileNotFoundError(f"Berkas sumber tidak ditemukan: {full_path}")
        with open(full_path, "r", encoding="utf-8") as f:
            content = f.read().rstrip()

        lines.append(f"<<<FILE: {display_path}>>>")
        lines.append(content)
        lines.append("<<<END FILE>>>")
        lines.append("")

    return "\n".join(lines).rstrip() + "\n"


def main():
    check_mode = "--check" in sys.argv
    script_dir = os.path.dirname(os.path.abspath(__file__))
    root_dir = os.path.abspath(os.path.join(script_dir, "..", ".."))
    target_path = os.path.join(root_dir, "zlce-kit", "ZLCE_KIT_SINGLE.md")

    try:
        bundled_content = generate_bundle(root_dir)
    except Exception as e:
        print(f"[ERROR] Gagal merangkai bundel: {e}", file=sys.stderr)
        sys.exit(2)

    if check_mode:
        if not os.path.exists(target_path):
            print(f"[ERROR] {target_path} tidak ditemukan.", file=sys.stderr)
            sys.exit(1)
        with open(target_path, "r", encoding="utf-8") as f:
            current_content = f.read()

        if current_content == bundled_content:
            print("[OK] ZLCE kit bundle is in sync.")
            sys.exit(0)
        else:
            print("[ERROR] ZLCE kit bundle is out of sync. Run python3 scripts/zlce/zlce-bundle.py to update.", file=sys.stderr)
            sys.exit(1)
    else:
        with open(target_path, "w", encoding="utf-8") as f:
            f.write(bundled_content)
        print(f"[OK] Rebuilt {os.path.relpath(target_path, root_dir)} successfully ({len(bundled_content)} bytes).")
        sys.exit(0)


if __name__ == "__main__":
    main()
