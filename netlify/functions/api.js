const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const serverless = require('serverless-http');

const app = express();
const router = express.Router();

app.use(cors());
app.use(express.json());

// Mengambil connection string dari environment variable di Netlify
const NEON_CONNECTION_STRING = process.env.NEON_CONNECTION_STRING;

const pool = new Pool({
  connectionString: NEON_CONNECTION_STRING,
});

// GET /api/santri - Mengambil semua data santri
router.get('/santri', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM santri ORDER BY nama ASC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Terjadi kesalahan pada server' });
  }
});

// POST /api/santri - Menambah santri baru
router.post('/santri', async (req, res) => {
  try {
    const { nama, saldo, riwayat } = req.body;
    const query = 'INSERT INTO santri (nama, saldo, riwayat) VALUES ($1, $2, $3) RETURNING *';
    const values = [nama, saldo, JSON.stringify(riwayat || [])];
    const { rows } = await pool.query(query, values);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal menambahkan santri' });
  }
});

// PUT /api/santri/:id - Memperbarui data (transaksi)
router.put('/santri/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { saldo, riwayat } = req.body;
        const query = 'UPDATE santri SET saldo = $1, riwayat = $2 WHERE id = $3 RETURNING *';
        const values = [saldo, JSON.stringify(riwayat || []), id];
        const { rows } = await pool.query(query, values);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Santri tidak ditemukan' });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Gagal memperbarui data santri' });
    }
});

// DELETE /api/santri/:id - Menghapus santri
router.delete('/santri/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const query = 'DELETE FROM santri WHERE id = $1 RETURNING *';
        const { rows } = await pool.query(query, [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Santri tidak ditemukan' });
        }
        res.status(200).json({ message: 'Santri berhasil dihapus' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Gagal menghapus santri' });
    }
});

// Gunakan router di bawah path /api
app.use('/api/', router);

// Ekspor handler untuk Netlify
module.exports.handler = serverless(app);
