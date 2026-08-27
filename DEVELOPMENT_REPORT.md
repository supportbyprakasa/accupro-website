# Laporan Pengerjaan — Enhance Layout per Section, per Halaman

**Website Accupro International**
27 Agustus 2026

Laporan ini disusun per halaman, lalu per section di dalam halaman itu (section 1, section 2, dst — sesuai urutan tampil dari atas ke bawah), supaya gambaran tiap halaman lengkap. Section yang di-enhance dijelaskan detail perubahan tampilan/strukturnya; section yang tidak disentuh tetap dicantumkan sebagai konteks.

Status yang dipakai:

- 🔵 **BARU** — section ini tidak ada sebelumnya, dibuat dari nol
- 🟢 **DIDESAIN ULANG** — sudah ada sebelumnya, tapi tampilan/strukturnya dibangun ulang
- 🟡 **DIPERBAIKI** — strukturnya tetap sama, ada perbaikan kecil (ikon, jarak, warna)
- ⚪ **TIDAK DIUBAH** — dibiarkan seperti semula

Total ada **10 jenis halaman** (beberapa dipakai berulang — 24 halaman detail layanan dan 5 halaman kategori sama-sama pakai satu pola tampilan, begitu juga 9 halaman kalkulator).

---

## 1. Beranda — `index.html`
**9 section, urut dari atas:**

1. 🟢 **Section 1 — Hero.** Sebelumnya: foto selebar layar penuh sebagai latar, overlay gelap di atasnya, judul/tombol/statistik menumpuk di depan foto — dan wadahnya punya tinggi tetap (bisa sampai ±1.100px) dengan `overflow:hidden`, jadi di sejumlah ukuran layar tombol dan angka statistik ikut terpotong tak terlihat. Sekarang: layout dua kolom berdampingan — tulisan di kiri, foto di kanan dalam bingkai membulat (radius 20px, disamakan dengan bingkai foto di semua halaman lain) dengan bayangan halus. Wadahnya sekarang mengikuti tinggi konten aktif, jadi tidak ada lagi yang terpotong. Foto juga ikut berganti otomatis bersamaan dengan 3 judul yang bergantian berputar setiap beberapa detik — sebelumnya hanya judulnya yang berputar, fotonya diam.
2. 🔵 **Section 2 — Kotak "Service Finder".** Dua dropdown berurutan (pilih area layanan → pilih layanan spesifik) + tombol buka halaman. Sebelumnya elemen ini ditumpuk di dalam section Hero, di atas foto — sekarang dipindah jadi section tersendiri dengan kotak/kartu sendiri tepat di bawah Hero, sehingga Hero tidak lagi penuh sesak.
3. ⚪ **Section 3 — "What You Can Get".** 3 kartu (Taxes, Legality, Book Keeping).
4. 🟡 **Section 4 — "Five areas, 24 services".** 6 kartu kategori layanan. Ikon tiap kartu sebelumnya kecil (±16px) dan warnanya pudar — diperbesar ke 24–26px dan diberi warna navy tegas; jarak ikon ke teks yang sebelumnya di-override jadi 8px dikembalikan ke standar 12px supaya tidak terlihat mepet.
5. ⚪ **Section 5 — Blok navy "For foreign-owned business".** Info khusus PMA/investor asing, 6 tautan layanan terkait.
6. 🟡 **Section 6 — "Work out the numbers first".** Pratinjau kalkulator, 3 kartu. Ikon diperbesar dengan cara yang sama seperti section 4, jarak antar-elemen kartu dirapikan.
7. ⚪ **Section 7 — "What clients say".** 4 testimoni, deretan logo klien.
8. 🟡 **Section 8 — "Four steps".** Cara kerja 4 langkah. Ikon yang sebelumnya pudar/kecil diperbesar dan diberi warna tegas, sama seperti section 4 dan 6.
9. ⚪ **Section 9 — CTA band** ("Consult Your Business for Free Now!").

---

## 2. Tentang Kami — `about.html`
**6 section:**

1. 🟢 **Section 1 — Hero.** Dibangun ulang ke pola dua kolom yang sama seperti Beranda: tulisan kiri, foto kanan dalam bingkai membulat radius 20px — bukan lagi foto besar penuh dengan tulisan menumpuk di bawahnya.
2. ⚪ **Section 2 — Statistik** (95% / 80% / 24 / 3) + foto kantor.
3. ⚪ **Section 3 — "Integrity, Professionalism and Innovation"** + **"Why we exist"**.
4. ⚪ **Section 4 — "Four people behind the work".** 4 kartu tim.
5. ⚪ **Section 5 — "Licences, certification and memberships".** 4 lisensi.
6. ⚪ **Section 6 — "Two offices in North Jakarta".**
+ CTA band (tidak diubah)

---

## 3. Daftar Layanan — `services.html`
**3 bagian utama:**

1. 🟢 **Bagian 1 — Hero + kotak pencarian layanan.** Layout dua kolom sama seperti halaman lain; kotak pencarian layanan digabung menyatu di sisi teks, bukan lagi elemen terpisah di bawah foto besar.
2. ⚪ **Bagian 2 — Bar filter kategori** (menempel di atas layar saat di-scroll).
3. 🟡 **Bagian 3 — 5 kelompok kategori.** Tiap kelompok berisi kartu ringkasan kategori + daftar kartu layanan di dalamnya (24 kartu layanan total). Ikon di tiap kartu layanan sebelumnya kecil dan pudar — diperbesar dan dipertegas warnanya, konsisten dengan perbaikan ikon di Beranda.
+ CTA band (tidak diubah)

---

## 4. Halaman Kategori — 5 halaman
*(Tax & Reporting, Registration & Tax Accounts, Company Legality, Stay Permits & Visa, Trademark & IP — kelimanya pakai satu pola tampilan yang sama)*

1. 🟢 **Section 1 — Hero.** Layout dua kolom sama seperti halaman lain, dipakai konsisten di kelima halaman kategori.
2. ⚪ **Section 2 — "At a glance".** Tabel ringkasan (siapa target, estimasi waktu, kisaran biaya, bahasa layanan).
3. ⚪ **Section 3 — "Services in this area".** Tabel perbandingan layanan di kategori itu.
4. ⚪ **Section 4 — "Which one do I need?".** Panduan memilih.
5. ⚪ **Section 5 — "Frequently asked".**
+ CTA band (tidak diubah)

---

## 5. Halaman Detail Layanan — 24 halaman
*(mis. "Pengurusan NPWP", "KITAS Kerja" — semua 24 halaman pakai satu pola tampilan yang sama)*

1. 🟢 **Section 1 — Hero.** Layout dua kolom, menampilkan nama layanan + label kategorinya, dipakai konsisten di seluruh 24 halaman.
2. 🔵 **Section 2 — Kartu "Content coming soon".** Kartu baru dengan bingkai, judul, dan ajakan menghubungi Accupro, disusun berdampingan dengan daftar tautan ke layanan lain di kategori yang sama.
+ CTA band (tidak diubah)

---

## 6. Tools & Calculators — `tools.html`
**3 bagian:**

1. 🟢 **Bagian 1 — Hero.** Layout dua kolom sama seperti halaman lain.
2. 🔵 **Bagian 2 — Grid 5 kalkulator pajak + grid 4 simulator Accupro.** Sebelumnya kumpulan kartu statis (tanpa tautan). Disusun ulang sebagai grid kartu yang masing-masing berupa tautan (link tile) ke halaman kalkulatornya sendiri, lengkap dengan status hover.
3. ⚪ **Bagian 3 — Kotak disclaimer** ("These results are estimates").
+ CTA band (tidak diubah)

---

## 7. Halaman Kalkulator — 9 halaman
*(satu halaman per kalkulator — seluruh sectionnya baru, tidak ada sebelumnya sama sekali)*

1. 🔵 **Section 1 — Hero.** Layout dua kolom yang sama dengan halaman lain, menampilkan nama kalkulator.
2. 🔵 **Section 2 — Form Input (kiri) + Result, Riwayat Perhitungan, dan tombol ke layanan terkait (kanan).** Layout dua kolom: kolom kiri berisi field input (angka/pilihan) tersusun vertikal; kolom kanan berisi kartu hasil, daftar riwayat perhitungan sebelumnya, dan tombol ke halaman layanan terkait — semua baru dibangun dari nol.
3. 🔵 **Section 3 — Kotak disclaimer** ("This result is an estimate").
+ CTA band (tidak diubah)

**Daftar 9 halamannya:**

| # | Nama Kalkulator |
|---|---|
| 1 | Kalkulator PPh Badan |
| 2 | Kalkulator PPh 21 TER (bulanan) |
| 3 | Kalkulator PPh 21 Tahunan |
| 4 | Kalkulator PPh 23 |
| 5 | Kalkulator PPh Pasal 4(2) |
| 6 | Simulator Biaya & Waktu Pendirian Perusahaan |
| 7 | Cek Syarat Dokumen & Waktu KITAS |
| 8 | Simulator Biaya Pendaftaran Merek |
| 9 | Cek Kewajiban Pajak Bulanan |

---

## 8. Halaman Artikel — `articles.html`
**4 section:**

1. 🟢 **Section 1 — Hero.** Layout dua kolom sama seperti halaman lain.
2. ⚪ **Section 2 — Kotak highlight** ("Clear guidance, practical answers...").
3. ⚪ **Section 3 — Artikel unggulan** + form pencarian + daftar kategori.
4. ⚪ **Section 4 — Filter kategori** + grid 6 artikel contoh + navigasi halaman.
+ CTA band (tidak diubah)

---

## 9. Halaman Kontak — `contact.html`
**4 section:**

1. 🟢 **Section 1 — Hero.** Layout dua kolom sama seperti halaman lain.
2. ⚪ **Section 2 — 4 kartu metode kontak** (WhatsApp, telepon utama, telepon kedua, email).
3. ⚪ **Section 3 — Form "Request a quote"** + kartu 2 kantor + jam operasional + peta.
4. ⚪ **Section 4 — FAQ** ("Before you write") — 6 pertanyaan.

*(Halaman ini tidak diakhiri CTA band karena isinya sendiri sudah ajakan kontak.)*

---

## 10. Halaman Tidak Ditemukan — `404.html`

1. ⚪ **Satu section**: pesan halaman tidak ada + tombol ke Services dan Contact. Tidak ada layout yang di-enhance di halaman ini.

---

## Ringkasan Perubahan per Jenis Section

| Status | Jumlah jenis section |
|---|---|
| 🔵 Baru total | 3 pola section — Service Finder di beranda; kartu "Coming soon" (dipakai di 24 halaman); seluruh halaman kalkulator (9 halaman × 3 section) |
| 🟢 Didesain ulang | 8 — Hero di: Beranda, Tentang Kami, Daftar Layanan, Kategori ×5 halaman, Detail Layanan ×24 halaman, Tools, Artikel, Kontak |
| 🟡 Diperbaiki (ikon/jarak/warna) | 4 — Five areas, Work out the numbers, Four steps di beranda; kartu layanan di Daftar Layanan |
| ⚪ Tidak diubah | Sisanya — kerangka konten dan tabel yang sudah ada sebelumnya dipertahankan |

**Catatan konsisten di semua Hero yang didesain ulang:** foto dan tulisan sekarang berdampingan dalam satu baris (bukan foto besar di atas, tulisan menumpuk di bawah), foto dibingkai membulat dengan radius yang disamakan (20px) di semua halaman dan bayangan halus, dan tingginya turun signifikan dibanding pola sebelumnya — dari yang tadinya bisa mencapai 1.100-an piksel di halaman utama, sekarang berkisar 400–650 piksel tergantung halamannya.
