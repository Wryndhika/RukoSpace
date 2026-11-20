# RukoSpace - Sistem Sewa Ruko (Project Kuliah)
## Menjalankan
1. Ekstrak ZIP dan buka folder di VS Code.
2. Gunakan ekstensi Live Server lalu buka `index.html`.
3. Akun demo:
   - Administrator: `admin` / `admin123`
   - Pemilik toko: `pemilik` / `owner123`
   - Penyewa: `penyewa` / `user123`

## Peran
- **Administrator:** dashboard, melihat seluruh data, pengajuan, pembayaran, laporan komisi platform (10%). Admin tidak menambah/mengubah/menghapus ruko.
- **Pemilik toko:** menambah/edit/hapus ruko miliknya, unggah foto, melihat status sewa dan pendapatan bersih setelah komisi 10%.
- **Penyewa:** melihat katalog, mengajukan sewa dan simulasi pembayaran.

## Upload gambar
Pada akun pemilik, masuk menu Ruko Saya > Tambah Ruko > pilih Foto Ruko > Simpan. Foto disimpan sebagai Data URL pada LocalStorage. Untuk demo, gunakan gambar kecil (misalnya < 1 MB), sebab LocalStorage terbatas.

## Payment gateway
Pembayaran saat ini masih **simulasi**, bukan Midtrans/Xendit sungguhan. Integrasi real memerlukan backend (misalnya Node.js/Express), database, akun merchant, endpoint membuat transaksi, dan webhook untuk validasi pembayaran. Server Key Midtrans/Xendit **jangan pernah ditaruh di app.js/browser**.
Gambaran alur: browser -> backend -> Midtrans Snap/Xendit Invoice -> halaman checkout -> webhook backend -> update status transaksi/ruko. Untuk Midtrans, backend membuat Snap transaction dan frontend membuka Snap token. Untuk Xendit, backend membuat Invoice dan frontend membuka invoice URL. Status hanya dianggap lunas setelah webhook backend terverifikasi.

## Catatan
Versi ini menggunakan LocalStorage, sehingga hanya demo frontend; akun dan role bukan keamanan sungguhan. Commission default 10% dihitung sebagai komisi admin dan sisa 90% menjadi pendapatan pemilik. Sesuaikan sesuai ketentuan tugas.
