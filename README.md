# PatunganYuk

Aplikasi web full-stack untuk mengelola patungan, mencatat pengeluaran bersama, menghitung saldo antaranggota, dan menyelesaikan utang. Dibuat dengan React + Vite sebagai frontend dan Java Spring Boot sebagai backend, dengan database PostgreSQL.

## Peserta

- **Nama:** Ade Dermawan
- **Program:** Pelatihan React dan Java Spring Boot
- **Tahun:** 2026

## Deskripsi

PatunganYuk membantu sekelompok orang mengelola keuangan bersama. Pengguna dapat membuat grup (misal "Liburan Bali", "Kos Bersama"), mencatat pengeluaran, membagi tanggungan, dan sistem otomatis menghitung siapa berutang ke siapa. Dilengkapi dengan grafik keuangan, struk pembayaran digital, dan konsol admin.

## Fitur

### Autentikasi
- Registrasi pengguna dengan validasi input
- Login dengan verifikasi password (hash SHA-256)
- Session disimpan di localStorage

### Grup
- Buat, tampil, ubah, hapus grup
- Field: nama, kategori, deskripsi
- Creator otomatis menjadi anggota pertama
- Filter grup berdasarkan user
- Pencarian dan pengurutan

### Anggota Grup
- Tambah, tampil, ubah, hapus anggota
- Field: nama, email, telepon
- Auto-link dengan user terdaftar berdasarkan email

### Pengeluaran
- Catat, tampil, ubah, hapus pengeluaran
- Pengeluaran grup dan pengeluaran pribadi
- Field: judul, nominal, pembayar, kategori, tanggal, catatan
- Detail pembagian per anggota
- Pembagian rata otomatis jika tidak ada detail manual
- Filter dan pengurutan

### Pelunasan
- Catat pelunasan antar anggota
- Hitung saldo grup otomatis
- Saran pelunasan untuk meminimalkan transfer
- Hapus catatan pelunasan

### Kategori
- Buat, tampil, ubah, hapus kategori
- Field: nama, deskripsi, warna, status aktif
- Pencarian dan pengurutan

### Dashboard
- Ringkasan posisi keuangan (piutang, utang, pengeluaran pribadi)
- Progress budget bulanan
- Grafik tren 6 bulan
- Grafik donut pengeluaran per kategori
- Daftar transaksi terbaru dengan pencarian dan pengurutan

### Riwayat Aktivitas
- Semua transaksi dari seluruh grup pengguna
- Dikelompokkan per tanggal
- Pencarian dan pengurutan

### Admin Console
- Statistik sistem: total user, grup, transaksi, perputaran uang
- CRUD user
- Daftar grup
- Kelola laporan kendala (terbuka/selesai)

### Struk Pembayaran
- Struk digital untuk setiap pencatatan pengeluaran dan pelunasan
- Tampilan bergaya thermal receipt
- Fitur cetak

### Antarmuka
- Responsif desktop dan mobile
- Tema thermal receipt (font monospace, border dashed)
- Modal konfirmasi untuk aksi hapus
- Notifikasi toast
- Skeleton loading
- Animasi confetti saat aksi berhasil
- AI Assistant untuk bantuan cepat

## Teknologi

### Frontend
- React 19
- Vite
- React Router DOM
- Tailwind CSS v4
- Lucide React
- pnpm

### Backend
- Java 17
- Spring Boot
- Spring Web
- Spring Data JPA
- Maven
- PostgreSQL

## Struktur Proyek

```text
.
├── README.md
├── PatunganYuk.postman_collection.json
├── backend/
│   ├── pom.xml
│   ├── mvnw
│   ├── mvnw.cmd
│   └── src/main/
│       ├── java/com/patunganyuk/backend/
│       │   ├── config/       # Konfigurasi CORS
│       │   ├── controller/   # REST API
│       │   ├── dto/          # Data Transfer Object
│       │   ├── entity/       # Entitas JPA
│       │   ├── exception/    # Penanganan error
│       │   ├── repository/   # Repository JPA
│       │   └── service/      # Business logic
│       └── resources/
│           └── application.properties.example
└── frontend/
    ├── .env.example
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── components/       # Komponen reusable dan UI
        ├── hooks/            # Custom hooks
        ├── pages/            # Halaman aplikasi
        ├── services/         # Pemanggilan API
        ├── App.jsx
        └── main.jsx
```

## Prasyarat

- Java Development Kit (JDK) 17 atau lebih baru
- Node.js 18 atau lebih baru
- pnpm
- PostgreSQL lokal atau akun Supabase

Verifikasi instalasi:

```bash
java -version
node --version
pnpm --version
```

## Konfigurasi Database

Buat database PostgreSQL:

```sql
CREATE DATABASE patunganyuk_db;
```

Salin file konfigurasi contoh:

**Windows (PowerShell):**
```powershell
Copy-Item backend/src/main/resources/application.properties.example backend/src/main/resources/application.properties
```

**Linux/macOS:**
```bash
cp backend/src/main/resources/application.properties.example backend/src/main/resources/application.properties
```

Edit file `application.properties` dan isi kredensial database:

**Untuk PostgreSQL lokal:**
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/patunganyuk_db
spring.datasource.username=postgres
spring.datasource.password=YOUR_PASSWORD
spring.datasource.driver-class-name=org.postgresql.Driver
```

**Untuk Supabase:**
```properties
spring.datasource.url=jdbc:postgresql://YOUR_HOST:6543/postgres?sslmode=require&prepareThreshold=0
spring.datasource.username=postgres.YOUR_PROJECT_ID
spring.datasource.password=YOUR_PASSWORD
spring.datasource.driver-class-name=org.postgresql.Driver
```

Konfigurasi JPA:
```properties
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

Tabel akan otomatis dibuat oleh Hibernate saat backend pertama kali dijalankan:
- `users`
- `groups`
- `group_members`
- `expenses`
- `expense_details`
- `settlements`
- `categories`
- `activities`
- `issue_reports`

## Menjalankan Backend

```bash
cd backend

# Windows
./mvnw.cmd spring-boot:run

# Linux/macOS
./mvnw spring-boot:run
```

Backend berjalan di `http://localhost:8080`

Base URL API: `http://localhost:8080/api`

Verifikasi: buka `http://localhost:8080/api/groups` di browser.

## Menjalankan Frontend

Buat file `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

Install dependency dan jalankan:

```bash
cd frontend
pnpm install
pnpm dev
```

Frontend berjalan di `http://localhost:5173`

Perintah lainnya:

```bash
pnpm build    # Build production
pnpm preview  # Preview build production
pnpm lint     # Jalankan linter
```

## REST API

Base URL: `http://localhost:8080/api`

Format response:

**Success:**
```json
{
  "status": "success",
  "data": {}
}
```

**Error:**
```json
{
  "status": "error",
  "message": "Deskripsi error",
  "data": null
}
```

### Authentication dan User

| Method | Endpoint | Keterangan |
|---|---|---|
| POST | `/auth/register` | Registrasi pengguna |
| POST | `/auth/login` | Login pengguna |
| GET | `/users` | Daftar pengguna (support `search`, `sortBy`, `direction`) |
| GET | `/users/{id}` | Detail pengguna |
| PUT | `/users/{id}` | Ubah pengguna |
| DELETE | `/users/{id}` | Hapus pengguna |
| GET | `/users/summary` | Ringkasan finansial user (param: `name`, `email`) |

### Groups dan Members

| Method | Endpoint | Keterangan |
|---|---|---|
| GET | `/groups` | Daftar grup (support `search`, `sortBy`, `direction`, `userName`, `userEmail`) |
| GET | `/groups/{id}` | Detail grup |
| POST | `/groups` | Buat grup |
| PUT | `/groups/{id}` | Ubah grup |
| DELETE | `/groups/{id}` | Hapus grup |
| GET | `/groups/{groupId}/members` | Daftar anggota (support `sortBy`, `direction`) |
| POST | `/groups/{groupId}/members` | Tambah anggota |
| PUT | `/groups/{groupId}/members/{memberId}` | Ubah anggota |
| DELETE | `/groups/{groupId}/members/{memberId}` | Hapus anggota |

### Expenses

| Method | Endpoint | Keterangan |
|---|---|---|
| GET | `/expenses` | Daftar seluruh pengeluaran (support `sortBy`, `direction`) |
| GET | `/expenses/non-group` | Daftar pengeluaran pribadi |
| POST | `/expenses/non-group` | Catat pengeluaran pribadi |
| GET | `/groups/{groupId}/expenses` | Pengeluaran dalam grup (support `sortBy`, `direction`) |
| POST | `/groups/{groupId}/expenses` | Catat pengeluaran grup |
| PUT | `/groups/{groupId}/expenses/{expenseId}` | Ubah pengeluaran |
| DELETE | `/groups/{groupId}/expenses/{expenseId}` | Hapus pengeluaran |

### Settlements dan Balances

| Method | Endpoint | Keterangan |
|---|---|---|
| GET | `/groups/{groupId}/settlements` | Riwayat pelunasan (support `sortBy`, `direction`) |
| POST | `/groups/{groupId}/settle` | Catat pelunasan |
| DELETE | `/groups/{groupId}/settlements/{settlementId}` | Hapus pelunasan |
| GET | `/groups/{groupId}/balances` | Hitung saldo dan saran pelunasan |

### Categories

| Method | Endpoint | Keterangan |
|---|---|---|
| GET | `/categories` | Daftar kategori (support `search`, `sortBy`, `direction`) |
| GET | `/categories/{id}` | Detail kategori |
| POST | `/categories` | Buat kategori |
| PUT | `/categories/{id}` | Ubah kategori |
| DELETE | `/categories/{id}` | Hapus kategori |

### Reports dan Activities

| Method | Endpoint | Keterangan |
|---|---|---|
| GET | `/reports` | Daftar laporan kendala |
| POST | `/reports` | Buat laporan kendala |
| PUT | `/reports/{id}/toggle` | Ubah status laporan |
| GET | `/activities` | Daftar aktivitas |

## Penerapan Konsep Java

### OOP
- `BaseEntity` adalah abstract class dengan method abstract `getSummary()`
- Seluruh entity extend `BaseEntity` dan override `getSummary()` dengan `@Override`
- Field private dengan getter dan setter
- Constructor overloading
- Keyword `this` pada constructor dan setter

### Interface
- `SplitwiseService` dan `SplitwiseServiceImpl`
- `UserService` dan `UserServiceImpl`
- `CategoryService` dan `CategoryServiceImpl`

### Method Overloading
- `getAllCategories()` / `getAllCategories(String search)` / `getAllCategories(String search, String sortBy, String direction)`
- `getUserFinancialSummary(String name)` / `getUserFinancialSummary(String name, String email)`
- `registerUser(User)` / `registerUser(User, String role)`

### Collection
- `List<T>` untuk return data
- `Map<String, Object>` untuk response JSON
- `HashMap` untuk aggregation data
- `ArrayList` dan `HashSet` pada `SplitwiseServiceImpl`

### Exception Handling
- `ResourceNotFoundException` untuk data tidak ditemukan (HTTP 404)
- `IllegalArgumentException` untuk validasi gagal (HTTP 400)
- `MethodArgumentTypeMismatchException` untuk ID tidak valid (HTTP 400)
- `GlobalExceptionHandler` dengan `@RestControllerAdvice` untuk semua exception

### Algoritma Who Owes Whom
1. Hitung saldo tiap anggota: total bayar dikurangi total tanggungan
2. Pisahkan anggota dengan saldo negatif (debitur) dan positif (kreditur)
3. Pasangkan debitur terbesar dengan kreditur terbesar
4. Ulangi sampai saldo mendekati nol

Implementasi: `SplitwiseServiceImpl.calculateBalances()`

## Keamanan

- Password di-hash dengan SHA-256 sebelum disimpan
- File `application.properties` tidak di-commit (masuk `.gitignore`)
- File `.env` tidak di-commit
- Password di-strip dari response JSON
- CORS hanya mengizinkan origin `http://localhost:5173` dan `http://127.0.0.1:5173`

## Postman Collection

Import `PatunganYuk.postman_collection.json` ke Postman untuk menguji seluruh endpoint. Collection mencakup request untuk semua operasi CRUD, pencarian, dan pengurutan.

## Screenshot

Screenshot aplikasi tersedia di folder `docs/screenshots/`:
- `dashboard.png` — Halaman dashboard
- `groups.png` — Halaman daftar grup
- `group-detail.png` — Detail grup
- `receipt.png` — Struk pembayaran
- `admin.png` — Admin console

## Lisensi

Proyek dibuat untuk keperluan Pelatihan React dan Java Spring Boot 2026.

**Dibuat oleh Ade Dermawan.**