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

> **Kalau dipasang di situs yang sudah punya isi** (accuprointernational.co.id):
> plugin ini mendeteksinya sendiri. Post type `layanan`, `team`, dan
> `testimonial` yang sudah didaftarkan plugin lain **tidak** didaftarkan ulang,
> dan 24 layanan yang sudah ada **diadopsi**, bukan digandakan — judul, isi, dan
> gambarnya tidak disentuh; yang ditambahkan hanya kategori (tanpa itu layanan
> lama tidak muncul di katalog) dan briefing foto bila kosong. Lihat bagian
> [Memasang di situs yang sudah berjalan](#memasang-di-situs-yang-sudah-berjalan).

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

## Memasang di situs yang sudah berjalan

Situs live memakai tema `zebizz` dengan Elementor Pro, dan plugin
`accupro-blocks` yang mendaftarkan post type `layanan`. Tiga hal yang sudah
ditangani plugin ini:

**1. Post type tidak didaftarkan dua kali.** `accupro_register_post_types()`
melewati tipe yang sudah ada. Post lama tetap utuh dan langsung dipakai tema
Accupro. Kalau ini terjadi, muncul pemberitahuan di dasbor supaya tidak ada
yang bingung kenapa label menunya berbeda dari dokumentasi ini.

**2. Slug layanan mengikuti yang asli, bukan yang di `data/site.json`.**
Generator statis memakai slug Inggris (`corporate-tax-processing`), WordPress
memakai slug Indonesia (`pengurusan-pajak-badan`). Peta lengkapnya ada di
`accupro_seed_service_slugs()` di `inc/seed.php`. Tanpa peta itu, seeder akan
membuat 24 layanan baru di sebelah yang lama — 48 layanan, separuhnya duplikat,
dan setiap URL yang sudah punya peringkat pencarian dapat kembaran.

**3. Konten lama diadopsi, tidak ditimpa.** Layanan dicari lewat slug, lalu
lewat judul persis; tim dan testimoni dicari lewat judul. Yang ditemukan
dilewati — hanya field kosong yang diisi.

Diuji dengan mensimulasikan kondisi live di WordPress lokal (24 layanan berslug
Indonesia tanpa kategori, 4 tim, 4 testimoni), lalu menjalankan seeder dua kali:

```
SEBELUM  layanan 24 | team 4 | testimonial 4 | kategori 0
SESUDAH  layanan 24 | team 4 | testimonial 4 | alat 9 | kategori 5
         duplikat berslug Inggris : 0
         layanan tanpa kategori   : 0
         isi layanan tetap utuh   : 24/24
         kutipan testimoni        : utuh
```

**Yang masih berubah dan tidak bisa dihindari**: mengaktifkan tema Accupro
mematikan seluruh layout Elementor. Itu memang tujuannya ("ganti total, tanpa
Elementor"), tapi terjadi seketika di situs publik — jadi lakukan di staging
dulu, atau di jam sepi dengan backup siap.

---

## Yang bisa diatur dari dasbor

| Menu | Isinya |
| --- | --- |
| **Accupro → Perusahaan** | Logo situs, nama, tagline, dua nomor telepon, WhatsApp, dua email, alamat, jam kerja, empat tautan sosial. Dipakai bar utilitas, footer, tombol WhatsApp mengambang, dan shortcode `[accupro_kontak]`. |
| **Accupro → Section Beranda** | Slide hero (judul, teks, gambar), pilar layanan (ikon, judul, teks, gambar), statistik (angka, keterangan, tampil di hero atau tidak), judul & teks CTA beserta foto pendampingnya, dan gambar bawaan untuk banner halaman. |
| **Layanan** | 24 layanan. Judul, isi, Featured Image, kategori, dan field "Ringkasan satu kalimat" yang tampil di kartu. |
| **Kategori Layanan** | Lima bidang. Nama, deskripsi, ikon, gambar kategori. |
| **Testimoni** | Judul = nama pemberi testimoni, isi = kutipannya, plus field Perusahaan. |
| **Tim** | Nama, foto, jabatan. |
| **Alat Hitung** | Kode kalkulator, jenis, label hasil, layanan pendamping, dan angka bisnis (JSON) untuk simulator. Nama dan keterangannya diisi dalam bahasa Indonesia saat seeding — lihat `accupro_seed_tool_labels()`. |
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

## Navigasi & logo

**Menu.** Atur di *Tampilan → Menu*, lokasi "Menu Utama". Selama belum diatur,
tema memakai menu bawaan yang isinya sama dengan situs live — Home, Tentang
Kami, Layanan, Kontak — ditambah Alat Hitung, halaman baru yang belum ada di
menu lama.

Item menu yang sedang dibuka diberi tanda `aria-current="page"` (garis bawah
navy). Penandaan itu dibandingkan lewat path URL, bukan ID post, supaya juga
benar untuk arsip custom post type dan halaman depan — keduanya tidak punya ID
yang bisa dipakai WordPress untuk menandainya sendiri. Halaman anak menyalakan
induknya: membuka `/layanan/pengurusan-pajak-badan/` membuat menu **Layanan**
tetap menyala.

**Logo.** Diatur di *Accupro → Perusahaan → Logo situs*, atau lewat Custom Logo
bawaan WordPress. Kalau keduanya kosong, tema memakai tanda SVG bawaan dan
menampilkan teks "ACCUPRO" di sebelahnya — itu cadangan supaya header tidak
pernah kosong, bukan logo yang benar. Begitu logo gambar diisi, teksnya
otomatis disembunyikan.

---

## Bahasa

Tema mengeluarkan **bahasa Indonesia saja**. Versi Inggris dan Mandarin
ditangani **TranslatePress**, yang sudah terpasang di situs ini dan
menerjemahkan hasil render — bukan menduplikasi post.

Karena itu:

- Setiap teks tetap di tema dan plugin dibungkus `__()` / `esc_html_e()` supaya
  terbaca TranslatePress.
- Pemilih bahasa di header memakai shortcode TranslatePress sendiri
  (`[language-switcher]`), dibungkus kotak `.langs` milik tema dan diratakan
  jadi satu baris berisi bendera + kode bahasa. Kalau TranslatePress tidak
  aktif, pemilih bahasa tidak dicetak sama sekali — tiga tautan yang menuju
  halaman tidak ada lebih buruk daripada tidak ada tombol.
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

### Audit layout

```sh
BASE=http://127.0.0.1:8181 node scripts/audit-layout.mjs
```

Membuka sembilan halaman di lima lebar layar (360, 414, 768, 1024, 1440) dengan
Chromium, lalu memeriksa: halaman bisa digulir menyamping, anak keluar dari
kotak induknya, elemen setara saling menimpa, jarak antar-elemen di bawah 8px,
dan target sentuh di bawah 30px. Jaraknya diukur teks ke teks — padding elemen
ikut dihitung sebagai jarak, karena itu yang dilihat mata. Butuh
`npm i playwright && npx playwright install chromium`.

Lint saja:

```sh
find wordpress -name '*.php' -not -name '._*' -exec php -l {} \;
```

---

## Beda dengan versi statis

- **Layout mengikuti `dist/`.** Struktur Section 1 di tema ini sama persis
  dengan keluaran generator statis: breadcrumb dalam container sendiri, lalu
  `.pagehero > .container.pagehero__grid` berisi `.pagehero__content` dan
  `.pagehero__frame`. Beranda memakai `.hero > .container.hero__grid` dengan
  `.hero__content` dan `.hero__media`. Seluruh gayanya sudah ada di
  `assets/css/style.css`; `style.css` tema **tidak boleh** berisi aturan untuk
  `.pagehero` atau `.hero` — uji asap memeriksanya. Sekali markup menyimpang
  dari `dist/`, CSS bersama itu berhenti cocok dan tata letaknya rusak.
- **Foto.** Versi statis memakai foto stok dari CDN sebagai isian sementara.
  Di sini sumbernya Media Library. Foto pendamping CTA dan banner halaman —
  yang di versi statis ikut tertanam di kode — sekarang jadi field tersendiri di
  *Accupro → Section Beranda*. Selama Featured Image belum diisi, yang
  tampil adalah placeholder bergaris yang tetap menjaga tinggi baris, jadi tata
  letak tidak melompat.
- **Lenis (smooth scroll)** tidak dimuat. `main.js` sudah mengeceknya dan
  berjalan normal tanpa itu — satu dependensi CDN lebih sedikit.
- **Elementor tidak dipakai.** Semua tata letak berasal dari template tema.
