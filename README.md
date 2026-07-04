# ⚙️ Lapor Pak! - Backend API Services

![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![MinIO](https://img.shields.io/badge/MinIO-C7202C?style=for-the-badge&logo=minio&logoColor=white)

Repositori ini berisi layanan *backend* (API) untuk **Lapor Pak**, sebuah sistem pelaporan infrastruktur publik. Dibangun dengan *framework* **NestJS** yang tangguh dan *scalable*, *backend* ini melayani seluruh alur data dari aplikasi *mobile*, mulai dari autentikasi, manajemen laporan, metrik statistik, hingga penyimpanan *file* media secara aman.

## ✨ Fitur Utama

*   **RESTful API Berbasis Modular**: Menggunakan arsitektur modular NestJS yang memisahkan tanggung jawab (*Separation of Concerns*) dengan rapi.
*   **Autentikasi & Otorisasi Kuat**: Terintegrasi penuh dengan **JWT (JSON Web Token)** dan sistem *Role-Based Access Control* (RBAC) menggunakan *Guards* kustom (Admin vs Warga).
*   **Database Relasional Efisien**: Memanfaatkan keandalan **PostgreSQL** yang dikelola dan dimigrasikan secara mulus melalui **Prisma ORM**.
*   **Object Storage (S3-Compatible)**: Penyimpanan *file* foto dan video ditenagai oleh **MinIO**, lengkap dengan filter validasi *MIME-type* dan optimasi aliran data (*Stream*).
*   **Standardisasi Respons**: Penggunaan global *Interceptor* untuk memastikan semua *output* API memiliki format pembungkus standar (`{ statusCode, message, data }`).
*   **Dokumentasi Otomatis**: Menyediakan spesifikasi OpenAPI (Swagger) yang men-generate dokumentasi secara dinamis.

## 🛠️ Stack Teknologi

*   **Framework**: NestJS (Node.js)
*   **Bahasa Pemrograman**: TypeScript
*   **ORM / Database Toolkit**: Prisma
*   **Database**: PostgreSQL
*   **Media Storage**: MinIO (S3 Compatible)
*   **Validasi**: `class-validator` & `class-transformer`

## 🚀 Cara Menjalankan (Getting Started)

### Prasyarat Instalasi
Pastikan komputer atau server lokal Anda telah memasang:
1. **Node.js** (versi 18.x atau yang lebih baru).
2. **PostgreSQL** (berjalan aktif dengan *database* kosong siap pakai).
3. **MinIO Server** (sebagai *host* penyimpanan *bucket* S3 lokal).

### Langkah Instalasi
1. *Clone* repositori ini:
   ```bash
   git clone https://github.com/Universitas-Cakrawala/backend-lapor-pak.git
   cd backend-lapor-pak
   ```
2. Instal semua dependensi NPM:
   ```bash
   npm install
   ```
3. Salin konfigurasi variabel lingkungan:
   ```bash
   cp .env.example .env
   ```
   *Buka file `.env` dan pastikan kredensial `DATABASE_URL` (PostgreSQL) serta kredensial API MinIO Anda sudah benar.*

4. Sinkronisasikan skema *database* menggunakan Prisma:
   ```bash
   npx prisma migrate dev
   ```
   *(Opsional) Untuk memuat data simulasi awal (seed):*
   ```bash
   npx prisma db seed
   ```

5. Nyalakan Server (Mode Development):
   ```bash
   npm run start:dev
   ```
   Server secara *default* akan berjalan pada port **3000** (`http://localhost:3000`).

## 📖 Dokumentasi API (Swagger)

Setelah server berjalan, Anda dapat meninjau seluruh kontrak *endpoint*, *schema* *request/response*, dan mengujinya secara interaktif melalui Swagger UI di:

👉 **`http://localhost:3000/api-docs`** 

> **Catatan:** Untuk mencoba *endpoint* yang terkunci, daftarkan *user* (atau login admin), *copy* Token JWT dari *response*, lalu tempelkan ke menu **Authorize** berlambang gembok di kanan atas antarmuka Swagger.

## 📂 Struktur Direktori

```text
src/
├── admin/        # Modul dasbor admin (metrik statistik dan grafik mingguan)
├── auth/         # Modul autentikasi (Login, Register, JWT Strategies)
├── common/       # Komponen global (Interceptors, Decorators, Filters, Guards)
├── media/        # Modul integrasi MinIO (Upload dan melayani Stream URL foto/video)
├── prisma/       # Prisma Module sebagai abstraksi tunggal ke database
├── reports/      # Logika pelaporan warga (CRUD, riwayat status, dan validasi form)
├── users/        # Manajemen User (Pengambilan profil, update FCM token)
└── main.ts       # Konfigurasi boot aplikasi, middleware, CORS, dan inisialisasi Swagger
```

## 🤝 Kontribusi & Lisensi

Sistem *backend* ini merupakan pendamping dan sumber kebenaran (Source of Truth) bagi aplikasi *mobile* "Lapor Pak". Dikembangkan secara khusus untuk memenuhi parameter *Product Requirements Document* (PRD) dari Tugas Akhir mata kuliah Mobile Computing, Universitas Cakrawala (Kelompok 5).

---
*Dibuat dengan ❤️ Titanio*
