<img width="1918" height="1028" alt="image" src="https://github.com/user-attachments/assets/d029b7ea-f54d-4a47-8f03-acd1459653ae" /># Library System with Geolocation

Backend sederhana untuk manajemen perpustakaan yang memiliki fitur peminjaman berbasis lokasi (Geolocation). Proyek ini menggunakan Node.js, Express.js, dan Sequelize (MySQL).

## Fitur Utama

1.  **Role-Based Access Control (Simulasi)**:
    *   **Admin**: Mengelola data buku (CRUD).
    *   **User**: Meminjam buku dengan mencatat lokasi (Latitude/Longitude).
2.  **Geolocation Tracking**: Menyimpan koordinat lokasi pengguna saat melakukan peminjaman.
3.  **Automatic Stock Management**: Stok buku berkurang saat dipinjam dan bertambah saat dikembalikan.

## Teknologi

*   **Backend**: Node.js, Express.js
*   **Database**: MySQL, Sequelize ORM
*   **Frontend**: React + Vite (sebagai antarmuka pengguna)

## Cara Menjalankan Aplikasi

### 1. Persiapan Database
Pastikan Anda memiliki database MySQL. Buat database baru bernama `library_db` (atau sesuaikan di file `.env`).

### 2. Setup Backend
```bash
cd backend
npm install

# DB_NAME=library_db
# DB_USER=root
# DB_PASSWORD=
# DB_HOST=localhost
# DB_DIALECT=mysql
# PORT=3000

node app.js
```
Server akan berjalan di `http://localhost:3000`.

### 3. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```
Buka browser di alamat yang muncul (biasanya `http://localhost:5173`).

---

## Dokumentasi API

### Public
*   `GET /api/books` : Melihat semua daftar buku.
*   `GET /api/books/:id` : Melihat detail satu buku.

### Admin Mode
(Header: `x-user-role: admin`)

*   `POST /api/books` : Tambah buku baru.
    *   Body: `{ "title": "Judul", "author": "Penulis", "stock": 10 }`
*   `PUT /api/books/:id` : Update data buku.
*   `DELETE /api/books/:id` : Hapus buku.

### User Mode
(Header: `x-user-role: user`, `x-user-id: [ID_USER]`)

*   `POST /api/borrow` : Meminjam buku.
    *   Body:
        ```json
        {
            "bookId": 1,
            "latitude": -6.2088,
            "longitude": 106.8456
        }
        ```
*   `POST /api/borrow/return` : Mengembalikan buku.
    *   Body: `{ "borrowId": 1 }`

---

## Struktur Database

### Tabel `Books`
| Kolom | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `id` | INTEGER | Primary Key, Auto Increment |
| `title` | STRING | Judul Buku |
| `author` | STRING | Penulis Buku |
| `stock` | INTEGER | Jumlah Stok |

### Tabel `BorrowLogs`
| Kolom | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `id` | INTEGER | Primary Key, Auto Increment |
| `userId` | INTEGER | ID Peminjam (Simulasi) |
| `bookId` | INTEGER | Foreign Key ke Tabel Books |
| `borrowDate` | DATETIME | Tanggal Peminjaman |
| `returnDate` | DATETIME | Tanggal Pengembalian (Null jika belum kembali) |
| `latitude` | FLOAT | Koordinat Lokasi Peminjam |
| `longitude` | FLOAT | Koordinat Lokasi Peminjam |

---

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/ecef594f-afce-47f5-9774-bde60724f1d0" />
<img width="1919" height="1028" alt="image" src="https://github.com/user-attachments/assets/82c959e2-c936-4cff-8fdf-fb62f2970b12" />
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/6bc673a4-b1ff-4d55-922d-87ad2c599e4c" />
<img width="1918" height="1028" alt="image" src="https://github.com/user-attachments/assets/51639cd5-bfe8-4bf8-aba1-9c5fa1b598b7" />
<img width="1919" height="1028" alt="image" src="https://github.com/user-attachments/assets/59f2c6d7-1fd8-4b18-a2f9-e5f4d3f48248" />
<img width="1919" height="1026" alt="image" src="https://github.com/user-attachments/assets/b657825b-272f-4505-b4b3-142abd63dda8" />
<img width="1919" height="1031" alt="image" src="https://github.com/user-attachments/assets/76ce4df0-a4d2-4e42-b38e-0be11e621769" />
<img width="1919" height="1033" alt="image" src="https://github.com/user-attachments/assets/af3ce6a4-0a76-44c8-954c-16de8a3230e3" />
<img width="1884" height="996" alt="image" src="https://github.com/user-attachments/assets/a0832caf-c7d8-4609-92f9-04074c471555" />
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/101116ba-6915-4c2d-839d-de73f555a246" />
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/a1aad724-2588-46aa-a460-cb9d562512f4" />
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/c9800c24-08f4-4d1e-8e0f-10f2382e3708" />
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/f254cdc2-a7f6-4ddb-a74c-47140396b117" />
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/77eb900d-08c0-4445-9362-3a33d3a41fb6" />



Validasi
<img width="1906" height="1028" alt="image" src="https://github.com/user-attachments/assets/4c930f9b-b0af-4c8c-a5aa-17b9a5ce8df0" />
<img width="1917" height="1029" alt="image" src="https://github.com/user-attachments/assets/2ebcf995-a4db-43e4-8719-e6d3993948e1" />
<img width="1919" height="1033" alt="image" src="https://github.com/user-attachments/assets/3687aa3e-5b8b-4ec9-bcc8-0a6c965327e7" />

    
