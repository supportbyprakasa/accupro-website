# Laporan Pengerjaan — Struktur Halaman & Section

**Website Accupro International — dibandingkan dengan accuprointernational.co.id**
26 Agustus 2026

Laporan ini disusun per halaman, lalu per section di dalam halaman itu (section 1, section 2, dst — sesuai urutan tampil dari atas ke bawah). Untuk setiap section ditandai statusnya:

- 🔵 **BARU** — section ini tidak ada sebelumnya, dibuat dari nol
- 🟢 **DIDESAIN ULANG** — sudah ada sebelumnya, tapi tampilan/strukturnya dibangun ulang
- 🟡 **DIPERBAIKI** — strukturnya tetap sama, ada perbaikan kecil (ikon, warna, teks, dsb)
- ⚪ **TIDAK DIUBAH** — dibiarkan seperti semula, dicantumkan di sini supaya gambaran halamannya lengkap

Total ada **10 jenis halaman** (beberapa dipakai berulang — 24 halaman detail layanan dan 5 halaman kategori sama-sama pakai satu pola tampilan, begitu juga 9 halaman kalkulator).

Elemen yang sama di **semua** halaman (tidak diulang per halaman di bawah):
- **Header** — logo, menu (Home / Services / Tools / About Us / Articles / Contact), pilihan bahasa, tombol "Free consultation"
- **Footer** — 4 kolom (profil & sosial media, daftar layanan, tautan perusahaan, info kontak) + hak cipta
- **Tombol WhatsApp mengambang** di pojok kanan bawah

---

## 1. Halaman Utama (Beranda) — `index.html`

**9 section, urut dari atas:**

1. 🟢 **Section paling atas (Hero)** — Sebelumnya foto selebar layar penuh dengan overlay gelap, judul & tombol menumpuk di bawahnya. Sekarang: foto dan tulisan berdampingan dalam bingkai membulat, latar terang, foto berganti otomatis mengikuti 3 judul yang bergantian berputar.
2. 🔵 **Kotak "Service Finder"** (pilih area layanan → pilih layanan spesifik → langsung diarahkan ke halamannya) — sebelumnya menempel di dalam Section Hero, sekarang jadi section sendiri tepat di bawahnya.
3. ⚪ **"What You Can Get"** — 3 kartu (Taxes, Legality, Book Keeping).
4. 🟡 **"Five areas, 24 services"** — 6 kartu kategori layanan. Ikonnya diperbesar; kalimat pembuka diperbarui karena kalimat lama menyebut sesuatu yang sudah tidak berlaku lagi.
5. ⚪ **Blok navy "For foreign-owned business"** — info khusus untuk PMA/investor asing, 6 tautan layanan terkait.
6. 🟡 **"Work out the numbers first"** — pratinjau kalkulator. Ikon diperbesar & jarak dirapikan; tautannya sekarang mengarah ke kalkulator yang benar-benar berfungsi (lihat bagian Tools di bawah).
7. ⚪ **"What clients say"** — 4 testimoni, deretan logo klien.
8. 🟡 **"Four steps"** — cara kerja 4 langkah. Ikon yang sebelumnya pudar/kecil diperbesar dan diberi warna tegas.
9. ⚪ **CTA band** ("Consult Your Business for Free Now!")

---

## 2. Tentang Kami — `about.html`

**6 section:**

1. 🟢 **Hero** — sama seperti pola baru di semua halaman lain: foto dan judul berdampingan, bukan foto besar dengan tulisan di bawahnya.
2. ⚪ **Statistik** (95% / 80% / 24 / 3) + foto kantor.
3. ⚪ **"Integrity, Professionalism and Innovation"** + **"Why we exist"**.
4. ⚪ **"Four people behind the work"** — 4 kartu tim.
5. ⚪ **"Licences, certification and memberships"** — 4 lisensi.
6. ⚪ **"Two offices in North Jakarta"**.
+ CTA band

---

## 3. Daftar Layanan — `services.html`

**3 bagian utama:**

1. 🟢 **Hero** + kotak pencarian layanan.
2. ⚪ **Bar filter kategori** (menempel di atas layar saat di-scroll).
3. 🟡 **5 kelompok kategori**, masing-masing berisi kartu ringkasan kategori + daftar kartu layanan di dalamnya. Ikon di setiap kartu layanan (24 kartu total) sebelumnya kecil dan pudar warnanya — sudah diperbesar dan dipertegas.
+ CTA band

---

## 4. Halaman Kategori (5 halaman: Tax & Reporting, Registration & Tax Accounts, Company Legality, Stay Permits & Visa, Trademark & IP)

Kelimanya pakai satu pola tampilan yang sama:

1. 🟢 **Hero**.
2. ⚪ **"At a glance"** — tabel ringkasan (siapa target, estimasi waktu, kisaran biaya, bahasa layanan).
3. ⚪ **"Services in this area"** — tabel perbandingan layanan di kategori itu.
4. ⚪ **"Which one do I need?"** — panduan memilih.
5. ⚪ **"Frequently asked"**.
+ CTA band

---

## 5. Halaman Detail Layanan (24 halaman — mis. "Pengurusan NPWP", "KITAS Kerja")

Semua 24 halaman pakai satu pola tampilan yang sama:

1. 🟢 **Hero** — nama layanan + kategori.
2. 🔵 **Kartu "Content coming soon"** + daftar layanan lain di kategori yang sama.

> Section 2 ini sempat dibangun lengkap (rincian proses, syarat dokumen, biaya, FAQ untuk tiap satu-satu dari 24 layanan), lalu dikosongkan kembali sesuai instruksi — karena website lama memang tidak punya isi apa pun di 24 halaman ini (bahkan tidak ada link ke sana sama sekali). Jadi sekarang section 2 hanya menampilkan status jujur: belum ada tulisan, dengan ajakan menghubungi Accupro langsung.

+ CTA band

---

## 6. Halaman Tools & Calculators — `tools.html`

**3 bagian:**

1. 🟢 **Hero**.
2. 🟢 **Grid 5 kalkulator pajak** + **grid 4 simulator Accupro** — sebelumnya kartu-kartu ini cuma tampilan tanpa link (statis), sekarang masing-masing mengarah ke halaman kalkulatornya sendiri yang berfungsi.
3. ⚪ **Kotak disclaimer** ("These results are estimates").
+ CTA band

---

## 7. Halaman Kalkulator (9 halaman — satu per kalkulator)

**Section ini semuanya baru, tidak ada sebelumnya sama sekali:**

1. 🔵 **Hero** — nama kalkulator.
2. 🔵 **Form Input** (kiri) **+ Result, Riwayat Perhitungan, dan tombol ke layanan terkait** (kanan) — pengunjung isi form, tekan Hitung, hasil dan rinciannya langsung muncul di sisi kanan. Riwayat perhitungan tersimpan otomatis di perangkat pengunjung.
3. 🔵 **Kotak disclaimer** ("This result is an estimate").
+ CTA band

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

1. 🟢 **Hero**.
2. ⚪ **Kotak highlight** ("Clear guidance, practical answers...").
3. ⚪ **Artikel unggulan** + form pencarian + daftar kategori.
4. ⚪ **Filter kategori** + grid 6 artikel contoh + navigasi halaman.
+ CTA band

---

## 9. Halaman Kontak — `contact.html`

**4 section:**

1. 🟢 **Hero**.
2. ⚪ **4 kartu metode kontak** (WhatsApp, telepon utama, telepon kedua, email).
3. ⚪ **Form "Request a quote"** + kartu 2 kantor + jam operasional + peta.
4. ⚪ **FAQ** ("Before you write") — 6 pertanyaan.

*(Halaman ini tidak diakhiri CTA band karena isinya sendiri sudah ajakan kontak.)*

---

## 10. Halaman Tidak Ditemukan — `404.html`

1. ⚪ **Satu section**: pesan halaman tidak ada + tombol ke Services dan Contact.

---

## Ringkasan Perubahan per Jenis Section

| Status | Jumlah jenis section |
|---|---|
| 🔵 Baru total | 3 pola section (Service Finder di beranda; kartu "Coming soon" — dipakai di 24 halaman; seluruh halaman kalkulator — 9 halaman) |
| 🟢 Didesain ulang | 8 (Hero di: Beranda, Tentang Kami, Daftar Layanan, Kategori ×5 halaman, Detail Layanan ×24 halaman, Tools, Artikel, Kontak) |
| 🟡 Diperbaiki (ikon/warna/teks) | 4 (Five areas, Work out the numbers, Four steps di beranda; kartu layanan di Daftar Layanan) |
| ⚪ Tidak diubah | Sisanya — kerangka konten dan tabel yang sudah ada sebelumnya dipertahankan |

**Catatan konsisten di semua Hero (section 1) setiap halaman:** foto dan tulisan sekarang berdampingan dalam satu baris (bukan foto besar di atas, tulisan menumpuk di bawah), foto dibingkai membulat dengan bayangan halus, dan tingginya turun signifikan dibanding pola sebelumnya — dari yang tadinya bisa mencapai 1.100-an piksel di halaman utama, sekarang berkisar 400–650 piksel tergantung halamannya.
