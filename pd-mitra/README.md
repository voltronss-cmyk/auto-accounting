# Akuntan Otomatis (PD MITRA)
Web app statis (HTML/JS) + Supabase (Auth + Postgres). Bisa di-host di GitHub Pages.

## Setup
1. Buat project di supabase.com → **Authentication → Providers → Email**: matikan *Confirm email*.
2. SQL Editor → jalankan `supabase/schema.sql` (tabel `projects` + Row Level Security).
3. Isi `js/config.js` dengan Project URL dan anon key.
4. Push ke GitHub → Settings → Pages → deploy dari branch `main` (root). Buka `index.html`.

Password di-hash oleh Supabase Auth; tidak ada kredensial di JavaScript. Uji mesin akuntansi: `node test/engine.test.js`.

## Struktur
`index.html` login/daftar · `app.html` shell · `js/engine.js` jurnal, FIFO, neraca lajur · `js/forms.js` jenis transaksi · `js/reports.js` preview · `js/app.js` router & UI.
Menambah bentuk transaksi baru: tambah `case` di `engine.js` dan definisi field di `forms.js`.
