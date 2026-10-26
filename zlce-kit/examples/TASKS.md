# DAFTAR TASK (TASKS.md): Todo API (contoh)

Contoh terisi dokumen kendali task ZLCE.

---

### TASK-001: Inisialisasi repo
* **Fase:** FASE 1
* **Deskripsi:** Inisialisasi struktur repositori, poetry/pipenv, dan linter.
* **Dependensi:** -
* **File:** pyproject.toml, README.md
* **Acceptance Criteria:**
  1. Linting lulus 0 error.
  2. Setup awal berhasil dijalankan.

---

### TASK-002: Skema database
* **Fase:** FASE 1
* **Deskripsi:** Definisi skema tabel todos dan migrasi basis data SQLite.
* **Dependensi:** TASK-001
* **File:** src/models/todo.py, migrations/001_todos.sql
* **Acceptance Criteria:**
  1. Migrasi up dan down berjalan sukses.
  2. Test migrasi lulus 100%.

---

### TASK-003: Endpoint CRUD
* **Fase:** FASE 2
* **Deskripsi:** Pembuatan endpoint REST API CRUD untuk entitas Todo.
* **Dependensi:** TASK-002
* **File:** src/routers/todos.py
* **Acceptance Criteria:**
  1. Endpoint GET, POST, PUT, DELETE berfungsi.
  2. Unit test endpoint lulus 100%.
