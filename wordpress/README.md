# Accupro untuk WordPress

Dua paket yang bekerja berpasangan:

| Paket | Isi |
| --- | --- |
| `accupro-core/` (plugin) | Struktur konten: Layanan, Testimoni, Tim, Alat Hitung, kategori layanan, dan seluruh pengaturan section. |
| `accupro-theme/` (tema) | Tampilan: header, hero slider, banner halaman, katalog layanan, halaman alat hitung, footer. |

Pemisahannya disengaja. Kalau suatu saat temanya diganti, seluruh konten tetap
ada karena tersimpan di plugin, bukan di tema.

---

## Pasang

1. **Zip masing-masing folder** (isi zip harus langsung berisi folder-nya):

   ```sh
   cd wordpress
   zip -r accupro-core.zip accupro-core -x '*.DS_Store' '._*'
   zip -r accupro-theme.zip accupro-theme -x '*.DS_Store' '._*'
   ```

2. **Plugin dulu, baru tema.** Di dasbor: *Plugin → Tambah Baru → Unggah Plugin*
   → `accupro-core.zip` → Aktifkan. Lalu *Tampilan → Tema → Tambah Baru →
   Unggah Tema* → `accupro-theme.zip` → Aktifkan.

   Urutannya penting: saat plugin diaktifkan, ia mengisi konten awal (24 layanan,
   5 kategori, 9 alat hitung, testimoni, tim, halaman Tentang Kami dan Kontak)
   dari `accupro-core/data/site.json`.

3. **Simpan permalink sekali.** *Pengaturan → Permalink → Simpan Perubahan.*
   Ini memastikan URL `/layanan/<slug>/` aktif.

4. **Set halaman depan** (kalau ingin beranda memakai hero slider):
   *Pengaturan → Membaca → Halaman depan menampilkan: Halaman statis.*
   Sebenarnya tidak wajib — `front-page.php` tetap dipakai WordPress untuk
   halaman depan apa pun pilihannya.

---

## Yang bisa diatur dari dasbor

| Menu | Isinya |
| --- | --- |
| **Accupro → Perusahaan** | Nama, tagline, dua nomor telepon, WhatsApp, dua email, alamat, jam kerja, empat tautan sosial. Dipakai bar utilitas, footer, tombol WhatsApp mengambang, dan shortcode `[accupro_kontak]`. |
| **Accupro → Section Beranda** | Slide hero (judul, teks, gambar), pilar layanan (ikon, judul, teks, gambar), statistik (angka, keterangan, tampil di hero atau tidak), judul & teks CTA. |
| **Layanan** | 24 layanan. Judul, isi, Featured Image, kategori, dan field "Ringkasan satu kalimat" yang tampil di kartu. |
| **Kategori Layanan** | Lima bidang. Nama, deskripsi, ikon, gambar kategori. |
| **Testimoni** | Judul = nama pemberi testimoni, isi = kutipannya, plus field Perusahaan. |
| **Tim** | Nama, foto, jabatan. |
| **Alat Hitung** | Kode kalkulator, jenis, label hasil, layanan pendamping, dan angka bisnis (JSON) untuk simulator. |
| **Tampilan → Menu** | Menu Utama dan kolom Perusahaan di footer. Kalau belum diatur, tema memakai daftar bawaan. |

Baris kosong pada tabel berulang (slide, pilar, statistik) otomatis dilewati —
jadi mengurangi slide dari tiga jadi dua cukup dengan mengosongkan judulnya.

---

## Shortcode

Bisa dipakai di halaman mana pun lewat editor WordPress:

| Shortcode | Hasil |
| --- | --- |
| `[accupro_layanan kategori="tax-reporting" jumlah="6" tampilan="grid"]` | Kartu layanan. `tampilan="list"` untuk baris memanjang. |
| `[accupro_kategori_layanan]` | Kartu lima bidang layanan. |
| `[accupro_testimoni jumlah="4"]` | Testimoni. |
| `[accupro_tim]` | Anggota tim. |
| `[accupro_alat jenis="tax"]` | Alat hitung. `jenis`: `tax`, `own`, atau `semua`. |
| `[accupro_kontak]` | Telepon, email, alamat, dan jam kerja dari pengaturan. |
| `[accupro_wa teks="Chat sekarang"]` | Tombol WhatsApp. |
| `[accupro_cta]` | Kotak ajakan konsultasi gratis. |

---

## Bahasa

Tema mengeluarkan **bahasa Indonesia saja**. Versi Inggris dan Mandarin
ditangani **TranslatePress**, yang sudah terpasang di situs ini dan
menerjemahkan hasil render — bukan menduplikasi post.

Karena itu:

- Setiap teks tetap di tema dan plugin dibungkus `__()` / `esc_html_e()` supaya
  terbaca TranslatePress.
- Pemilih bahasa di header memakai shortcode TranslatePress sendiri
  (`[language-switcher]`). Kalau TranslatePress tidak aktif, pemilih bahasa
  tidak dicetak sama sekali.
- Terjemahan EN/CH yang sudah ada di `data/site.json` (tagline, jam kerja, hero,
  pilar, statistik, CTA, testimoni) **belum** diimpor otomatis ke TranslatePress.
  Kalau ingin, isian itu bisa disalin manual lewat editor TranslatePress, atau
  dibuatkan skrip impor terpisah.

---

## Alat hitung

Seluruh perhitungan berjalan di browser pengunjung (`assets/js/calculators.js`).
Tidak ada angka yang dikirim ke server; riwayat hitung disimpan di
`localStorage` perangkat pengunjung sendiri.

Kode kalkulator pada field **Kode kalkulator** harus persis salah satu dari:
`pph-badan`, `pph21-ter`, `pph21-masa`, `pph23`, `pph4-2`,
`company-setup-cost`, `kitas-requirements`, `trademark-cost`,
`monthly-obligations`. Dropdown-nya sudah dibatasi ke daftar ini.

**Catatan akurasi** (sama seperti di versi statis): tabel bracket PPh 21 TER
disusun ulang dari ingatan, bukan disalin langsung dari lampiran PMK 168/2023.
Verifikasi ke lembaran resmi sebelum dipakai untuk keputusan payroll atau
pelaporan sungguhan.

Empat simulator (`company-setup-cost`, `kitas-requirements`, `trademark-cost`,
`monthly-obligations`) memakai angka bisnis placeholder. Ubah lewat field
**Angka bisnis (JSON)** di layar edit alat, bukan di file JS. JSON yang salah
format ditolak saat disimpan, jadi data rusak tidak pernah sampai ke halaman
depan.

---

## Uji sebelum unggah

```sh
php wordpress/tests/smoke.php
```

Menjalankan seluruh template lewat WordPress tiruan seadanya (`tests/stub-wp.php`)
dan memeriksa: seeder mengisi jumlah yang benar dan tidak menggandakan saat
dijalankan dua kali, setiap template render tanpa error PHP, hero menampilkan
slide sebanyak yang diatur, pencari layanan memuat 24 layanan, dan tidak ada
teks Inggris sisa versi statis yang lolos.

Yang **tidak** diuji di sana: query database sungguhan, rewrite rule, hook
priority, dan tampilan CSS. Itu semua tetap harus dicoba di WordPress asli —
sebaiknya di staging dulu, bukan langsung di domain produksi.

Lint saja:

```sh
find wordpress -name '*.php' -not -name '._*' -exec php -l {} \;
```

---

## Beda dengan versi statis

- **Foto.** Versi statis memakai foto stok dari CDN sebagai isian sementara.
  Di sini sumbernya Media Library. Selama Featured Image belum diisi, yang
  tampil adalah placeholder bergaris yang tetap menjaga tinggi baris, jadi tata
  letak tidak melompat.
- **Lenis (smooth scroll)** tidak dimuat. `main.js` sudah mengeceknya dan
  berjalan normal tanpa itu — satu dependensi CDN lebih sedikit.
- **Elementor tidak dipakai.** Semua tata letak berasal dari template tema.
