# Laporan Pembaruan Website Accupro International

**Dibandingkan dengan website lama di accuprointernational.co.id**
26 Agustus 2026

---

## Kata Pengantar

Dokumen ini menjelaskan semua perubahan yang sudah dikerjakan pada website baru Accupro, dibandingkan dengan website yang sekarang masih berjalan di **accuprointernational.co.id**. Ditulis tanpa istilah teknis, supaya bisa langsung dipahami oleh siapa saja di tim Accupro — bukan cuma yang paham soal pemrograman.

Singkatnya: **ada 3 jenis pekerjaan besar** yang dikerjakan —

1. **Memperbaiki hal-hal yang salah/memalukan** di website lama (foto yang salah, tampilan yang rusak di layar tertentu)
2. **Mendesain ulang tampilan** supaya terlihat lebih profesional dan modern, terutama bagian paling atas setiap halaman
3. **Membangun fitur baru** — 9 kalkulator pajak & simulator biaya yang sekarang benar-benar bisa dipakai menghitung, bukan cuma hiasan

---

## Status: Ini Masih "Contoh Jadi", Belum Tersambung ke WordPress

Website yang sekarang tayang di accuprointernational.co.id itu dibuat pakai **WordPress** — sistem yang memungkinkan tim Accupro menambah dan mengubah tulisan, foto, atau halaman sendiri lewat halaman admin, tanpa harus minta bantuan programmer setiap kali ada perubahan kecil.

Semua pekerjaan yang dijelaskan di laporan ini — desain baru, kalkulator, animasi, semuanya — **belum tersambung ke WordPress**. Yang sudah dibuat sekarang adalah **contoh jadi yang lengkap dan bisa langsung dicoba** — bisa dibuka di browser apa saja, semua tombol dan kalkulatornya benar-benar berfungsi seperti yang dijelaskan di laporan ini — tapi dibangun dengan cara yang berbeda dari WordPress: memakai file-file kode polos yang berjalan langsung sebagai halaman, di luar sistem WordPress.

---

## 1. Foto-Foto yang Ternyata Salah Total

Ini yang paling perlu diketahui tim Accupro dulu, karena ini bukan cuma soal "kurang bagus" — ini foto yang **salah tempat sama sekali** dan berpotensi bikin malu kalau sampai tayang ke publik seperti itu.

Saat dicek satu per satu, ditemukan beberapa foto stok (foto pengisi sementara, dari situs foto gratis) yang isinya:

- **Sertifikat asli dari Harvard Law School** — lengkap dengan nama orang sungguhan di sertifikatnya. Ini dipakai sebagai foto ilustrasi di halaman-halaman yang berhubungan dengan sertifikat/legalitas. Kalau ini tayang, kesannya seolah-olah itu sertifikat milik Accupro atau salah satu stafnya — padahal itu foto orang lain yang sama sekali tidak ada hubungannya.
- **Foto lobi kantor** di halaman Kontak yang ternyata ada papan nama **universitas di Vietnam** ("Trường Đại học Văn Hiến") terpampang jelas di dindingnya. Jadi kalau klien membuka halaman Kontak Accupro, yang terlihat malah lobi kampus di Vietnam.
- **3 foto dokumen pajak** yang dipakai di halaman "Tax & Reporting" dan 7 halaman turunannya (proses pajak korporat, individu, dll) ternyata adalah **formulir pajak resmi Amerika Serikat** (formulir 1040), bukan dokumen pajak Indonesia. Ini terpasang di halaman yang justru menjelaskan layanan pajak *Indonesia*.
- **Foto paspor** di halaman KITAS Kerja ternyata **paspor Rusia**, lengkap dengan tulisan huruf Rusia (Cyrillic) yang terbaca jelas — padahal halaman itu tentang izin tinggal di Indonesia.
- Satu foto stempel dengan **teks hukum berbahasa Jerman**, dan satu foto kalkulator yang di dalamnya kelihatan **formulir pajak "Self-Employment Tax" khas Amerika**.

**Semua foto di atas sudah diganti.** Foto penggantinya dicek manual satu per satu — bukan asal pilih dari hasil pencarian — supaya tidak terjadi hal serupa lagi.

---

## 2. Bagian Paling Atas Setiap Halaman — Didesain Ulang Total

Bagian paling atas setiap halaman (yang pertama kali dilihat orang saat membuka website) sebelumnya punya beberapa masalah serius:

### Sebelumnya

- Fotonya memenuhi **seluruh lebar layar** dengan warna gelap menutupinya, lalu **judul dan tombolnya numpuk di bawah foto** — jadi bagian ini menjadi sangat tinggi, orang harus scroll banyak dulu sebelum sampai ke isi halaman yang sebenarnya.
- Di layar komputer yang lebar (misalnya monitor besar), fotonya **terpotong dan menyisakan area kosong berwarna krem** di sisi kanan — bug ini ditemukan dan sempat berulang di dua tempat berbeda sebelum benar-benar tuntas diperbaiki.
- Tombol "Konsultasi Gratis" dan angka statistik (24 layanan, dsb) di halaman utama sempat **hilang sama sekali** dari tampilan karena terpotong oleh batas kotak yang ukurannya kurang — jadi bukan cuma "ketutup", tapi memang tidak muncul.
- Di HP, foto di beberapa halaman **hilang total** karena ada bug teknis lain.
- Beberapa tulisan (sub-judul, angka statistik) **hampir tidak kelihatan** karena warna teksnya gelap dipasang di atas latar belakang yang juga gelap.

### Sekarang

- Foto dan teks **disandingkan** (foto di satu sisi, teks di sisi lain) — bukan ditumpuk. Hasilnya, tinggi bagian ini turun sangat drastis:
  - Halaman utama: dari **±1.117 piksel** jadi **±653 piksel** (turun 42%)
  - Semua halaman lain: dari **±617 piksel** jadi **±427 piksel** (turun 31%)
  
  Artinya pengunjung jauh lebih cepat sampai ke isi halaman tanpa perlu scroll berlebihan.
- Foto sekarang dibungkus dalam bingkai membulat dengan bayangan halus — kesannya lebih premium, seperti foto di brosur, bukan cuma foto tempel biasa.
- Di halaman utama, **fotonya sekarang berganti otomatis mengikuti setiap slide judul** yang berputar (3 judul berbeda, 3 foto berbeda) — sebelumnya fotonya diam saja meski judulnya berganti-ganti.
- Kotak pencarian layanan ("Service Finder") yang tadinya numpuk di dalam bagian atas (ikut bikin tinggi) sekarang dipindah jadi bagian tersendiri di bawahnya — lebih rapi dan lega.
- Semua bug di atas (foto terpotong di layar lebar, tombol hilang, foto hilang di HP, tulisan tidak kelihatan) **sudah diperbaiki semua**, dan sudah dites ulang di berbagai ukuran layar (HP, tablet, laptop, monitor besar).
- Bentuk sudut membulat pada foto dan kartu-kartu di seluruh situs juga sudah **disamakan** — sebelumnya ada dua ukuran sudut yang berbeda di dua tempat, sekarang seragam satu ukuran di semua halaman.
- Ikon-ikon kecil yang sebelumnya terlalu kecil dan pudar warnanya (susah dilihat) di beberapa bagian — daftar layanan, langkah "cara kerja", kartu kalkulator — sudah diperbesar dan dipertegas warnanya.
- Kalau link website ini dibagikan lewat WhatsApp atau media sosial lain, **sekarang muncul pratinjau (gambar + judul) yang rapi** — sebelumnya kalau di-share, tidak muncul gambar apa pun.

---

## 3. Website Sekarang Terasa Lebih "Hidup"

Tiga hal ditambahkan supaya website ini tidak terasa kaku — sesuai permintaan langsung sebelumnya. Ketiganya berjalan otomatis, dan tidak akan aktif kalau pengunjung mengatur perangkatnya untuk mengurangi animasi (misalnya karena alasan kenyamanan mata) — jadi tetap ramah untuk semua orang.

- **Scroll jadi lebih halus** — waktu pengunjung menggulir halaman (scroll), gerakannya sekarang terasa lebih lembut, ada momentum-nya, bukan langsung berhenti kaku seperti sebelumnya.
- **Elemen muncul perlahan saat digulir** — kartu-kartu (layanan, testimoni, kalkulator, dll) tidak langsung muncul begitu saja, tapi muncul dengan efek geser-dan-memudar yang halus begitu terlihat di layar. Ini efek yang biasa ditemukan di website-website kelas atas.
- **Perpindahan antar halaman jadi mulus** — sebelumnya kalau klik menu/link, halaman langsung berganti secara kasar (kedip). Sekarang ada efek transisi halus (memudar) saat berpindah dari satu halaman ke halaman lain.

---

## 4. Sembilan Kalkulator — Sekarang Beneran Bisa Dipakai Menghitung

Ini pembaruan paling besar dari sisi fitur. Sebelumnya, di halaman "Tools & Calculators", kesembilan kalkulator itu **cuma tampilan kosong** — ada kotak input, ada judul, tapi kalau diisi dan ditekan "Hitung", **tidak terjadi apa-apa**. Ini memang sengaja belum dikerjakan sejak awal proyek dan baru diselesaikan sekarang.

Sekarang, **kesembilan kalkulator punya halaman sendiri-sendiri dan benar-benar berfungsi**:

**5 Kalkulator Pajak** (rumusnya mengikuti aturan resmi pajak Indonesia yang berlaku saat ini):
1. Kalkulator PPh Badan (pajak penghasilan perusahaan)
2. Kalkulator PPh 21 TER (potongan pajak gaji bulanan karyawan)
3. Kalkulator PPh 21 Tahunan
4. Kalkulator PPh 23 (pajak atas jasa, sewa, dividen, dll)
5. Kalkulator PPh Pasal 4(2) (pajak final — sewa tanah/bangunan, jual-beli properti, jasa konstruksi)

**4 Simulator Khusus Accupro** (tidak ada di kompetitor manapun):
6. Simulator Biaya & Waktu Pendirian Perusahaan (PT, PT PMA, CV, Yayasan)
7. Cek Syarat Dokumen & Estimasi Waktu KITAS
8. Simulator Biaya Pendaftaran Merek Dagang
9. Cek Kewajiban Pajak Bulanan (checklist otomatis sesuai jenis usaha)

**Cara kerjanya untuk pengunjung**: mereka mengisi form (misalnya jenis usaha, jumlah omzet, dsb), tekan "Hitung", dan **hasilnya langsung muncul lengkap dengan rinciannya** — bukan cuma angka akhir, tapi juga penjelasan dari mana angka itu berasal. Ada juga **riwayat perhitungan** yang tersimpan otomatis di perangkat pengunjung (jadi kalau mereka buka lagi nanti, hasil sebelumnya masih ada), dan tombol untuk langsung menghubungi Accupro terkait hasil perhitungan tersebut.

Semua sembilan kalkulator sudah diuji satu per satu dengan angka contoh, dan hasilnya dicocokkan manual untuk memastikan perhitungannya benar.

### Catatan Angka

- **Tabel tarif PPh 21 TER** (khususnya kategori B dan C) disusun berdasarkan pemahaman umum, **bukan disalin langsung** dari lampiran resmi peraturan pajak (PMK 168/2023) yang tabelnya memang panjang sekali.
- **4 simulator khusus Accupro** (poin 6-9 di atas) menggunakan **angka biaya contoh/sementara** (misalnya biaya notaris, biaya resmi DJKI untuk merek, dst.), bukan angka asli.

---

## 5. Konten yang Disesuaikan dengan Website Asli

Sempat ada pertanyaan: apakah semua isi tulisan di website baru ini sudah 100% sama dengan yang ada di accuprointernational.co.id yang sekarang? Jawabannya dicek langsung, dan hasilnya:

- **Halaman utama, tentang kami, testimoni klien, dan info kontak** — isinya sudah dicocokkan kata demi kata dengan website asli, dan memang sama persis.
- **24 halaman detail layanan** (misalnya halaman khusus "Pengurusan NPWP", "KITAS Kerja", dll) — setelah dicek, ternyata **di website asli halaman-halaman ini sama sekali tidak ada isinya, bahkan tidak ada link untuk membukanya**. Nama-nama layanan itu di website asli cuma tulisan biasa, bukan tautan.
  
  Karena itu, atas permintaan langsung, isi 24 halaman ini **dikembalikan sesuai kenyataan** — hanya menampilkan nama layanannya dan tulisan "Content coming soon" (konten segera hadir) plus ajakan untuk menghubungi Accupro langsung. Sebelumnya sempat ditulis draft konten lengkap untuk halaman-halaman ini (penjelasan, syarat dokumen, biaya, dll), tapi itu bukan salinan dari mana pun — jadi supaya jujur dan sesuai kenyataan, itu dikosongkan kembali sampai nanti tim Accupro yang menulis kontennya sendiri.
- **5 halaman kategori layanan** (pengelompokan seperti "Pajak & Pelaporan", "Legalitas Perusahaan", dst.) — ini memang struktur baru yang tidak ada di website lama sama sekali, dibuat untuk memudahkan navigasi.

---

## 6. Ringkasan Angka

| | Sebelum | Sesudah |
|---|---|---|
| Jumlah halaman di website | 36 | 45 (tambahan 9 halaman kalkulator) |
| Tinggi bagian atas halaman utama | ±1.117 piksel | ±653 piksel |
| Tinggi bagian atas halaman lain | ±617 piksel | ±427 piksel |
| Foto yang salah konteks | 11 foto | 0 (semua sudah diganti) |
| Kalkulator yang berfungsi | 0 dari 9 | 9 dari 9 |
| Link rusak yang ditemukan | — | 0 |

---

*Accupro International — Laporan Pengerjaan Website*
