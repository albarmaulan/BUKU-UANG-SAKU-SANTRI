// Mengimpor 'peralatan' yang dibutuhkan untuk membuat server
const express = require('express');
const { Pool } = require('pg'); // Driver untuk menghubungkan ke PostgreSQL
const cors = require('cors'); // Untuk mengizinkan koneksi dari frontend

// Membuat aplikasi server
const app = express();
app.use(cors()); // Mengizinkan semua koneksi
app.use(express.json()); // Agar server bisa membaca format JSON

// Kunci rahasia untuk koneksi ke database Neon
// PENTING: Simpan ini di environment variable, jangan langsung di kode!
const NEON_CONNECTION_STRING = "postgresql://user:password@host:port/dbname?sslmode=require";

// Membuat koneksi ke database
const pool = new Pool({
  connectionString: NEON_CONNECTION_STRING,
});

// --- API Endpoints (Pintu-pintu Server) ---

// 1. Pintu untuk MENGAMBIL semua data santri
app.get('/api/santri', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM santri ORDER BY nama ASC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Terjadi kesalahan pada server' });
  }
});

// 2. Pintu untuk MENAMBAH santri baru
app.post('/api/santri', async (req, res) => {
  try {
    const { nama, saldo, riwayat } = req.body;
    // Perintah SQL untuk memasukkan data baru
    const query = 'INSERT INTO santri (nama, saldo, riwayat) VALUES ($1, $2, $3) RETURNING *';
    // Menggunakan JSON.stringify untuk menyimpan array objek di kolom JSONB
    const values = [nama, saldo, JSON.stringify(riwayat)];
    const { rows } = await pool.query(query, values);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal menambahkan santri' });
  }
});

// Anda perlu membuat pintu lain untuk UPDATE (transaksi) dan DELETE santri

// Menjalankan server di port 3000
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
