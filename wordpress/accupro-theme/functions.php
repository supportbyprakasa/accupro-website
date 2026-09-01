<?php
/**
 * Accupro — setup tema.
 *
 * Tema ini hanya mengurus tampilan. Seluruh struktur konten (Layanan,
 * Testimoni, Tim, Alat Hitung, dan pengaturan section) ada di plugin
 * Accupro Core, supaya konten tidak ikut hilang kalau tema diganti.
 *
 * Bahasa: tema mengeluarkan bahasa Indonesia saja. Versi Inggris dan Mandarin
 * ditangani TranslatePress, yang menerjemahkan hasil render — jadi setiap teks
 * tetap yang tampil di depan harus dibungkus __() / esc_html_e() agar terbaca
 * olehnya.
 *
 * @package Accupro
 */

defined( 'ABSPATH' ) || exit;

define( 'ACCUPRO_THEME_VERSION', '1.0.0' );

require_once get_template_directory() . '/inc/icons.php';
require_once get_template_directory() . '/inc/media.php';
require_once get_template_directory() . '/inc/template-tags.php';
require_once get_template_directory() . '/inc/tool-forms.php';

/**
 * Dukungan fitur inti.
 */
function accupro_theme_setup() {
	load_theme_textdomain( 'accupro', get_template_directory() . '/languages' );

	add_theme_support( 'title-tag' );
	add_theme_support( 'post-thumbnails' );
	add_theme_support( 'automatic-feed-links' );
	add_theme_support( 'custom-logo', array(
		'height'    => 64,
		'width'     => 240,
		'flex-crop' => true,
	) );
	add_theme_support(
		'html5',
		array( 'search-form', 'comment-form', 'comment-list', 'gallery', 'caption', 'style', 'script' )
	);

	register_nav_menus(
		array(
			'primary'      => __( 'Menu Utama', 'accupro' ),
			'footer_kolom' => __( 'Footer — Perusahaan', 'accupro' ),
		)
	);

	// Ukuran kartu layanan/kategori, sesuai rasio 4:3 yang dipakai desain.
	add_image_size( 'accupro-card', 800, 600, true );
	add_image_size( 'accupro-hero', 1200, 1200, true );
	// Latar Section 1: lebar, tidak tinggi. Tanpa ukuran ini srcset melompat
	// dari 1024px langsung ke berkas asli, yang bisa beberapa megabita.
	add_image_size( 'accupro-wide', 1920, 820, true );
}
add_action( 'after_setup_theme', 'accupro_theme_setup' );

/**
 * Muat CSS dan JS.
 *
 * calculators.js sengaja hanya dimuat di halaman Alat Hitung — 400+ baris tabel
 * tarif tidak ada gunanya di halaman lain.
 */
function accupro_enqueue_assets() {
	$dir = get_template_directory_uri();

	wp_enqueue_style(
		'accupro',
		$dir . '/assets/css/style.css',
		array(),
		ACCUPRO_THEME_VERSION
	);

	// style.css tema (hanya header + override kecil) menyusul agar bisa menimpa.
	wp_enqueue_style(
		'accupro-theme',
		get_stylesheet_uri(),
		array( 'accupro' ),
		ACCUPRO_THEME_VERSION
	);

	wp_enqueue_script(
		'accupro-main',
		$dir . '/assets/js/main.js',
		array(),
		ACCUPRO_THEME_VERSION,
		true
	);

	if ( is_singular( 'alat' ) ) {
		wp_enqueue_script(
			'accupro-calculators',
			$dir . '/assets/js/calculators.js',
			array(),
			ACCUPRO_THEME_VERSION,
			true
		);

		// Label antarmuka kalkulator hidup di JavaScript, jadi tidak bisa lewat
		// __() di template. Dikirim dari sini supaya tetap melewati gettext dan
		// terbaca TranslatePress seperti teks lainnya.
		wp_localize_script(
			'accupro-calculators',
			'TOOL_I18N',
			array(
				'locale'       => 'id-ID',
				'emptyHistory' => __( 'Belum ada perhitungan — riwayat disimpan di perangkat Anda sendiri.', 'accupro' ),
				'checkInputs'  => __( 'Periksa isian di atas', 'accupro' ),
				'fillFields'   => __( 'Lengkapi semua kolom, lalu hitung lagi.', 'accupro' ),
				'copied'       => __( 'Tersalin', 'accupro' ),
				// Label baris dan catatan di panel hasil. Kuncinya teks Inggris
				// asli di calculators.js, jadi menambah kalkulator baru tidak
				// mengharuskan menyentuh berkas JS-nya — cukup tambah barisnya
				// di sini. Yang tidak ada padanannya tampil apa adanya.
				'strings'      => array(
					'0.5% — final tax, PP 55/2022' => __( '0,5% — pajak final, PP 55/2022', 'accupro' ),
					'Accupro service fee' => __( 'Jasa Accupro', 'accupro' ),
					'Applicable rate' => __( 'Tarif yang berlaku', 'accupro' ),
					'Applicant type' => __( 'Jenis pemohon', 'accupro' ),
					'Applied rate' => __( 'Tarif yang dikenakan', 'accupro' ),
					'Article 31E' => __( 'Fasilitas Pasal 31E', 'accupro' ),
					'Base rate' => __( 'Tarif dasar', 'accupro' ),
					'Biaya jabatan (5%, capped Rp 6,000,000/yr)' => __( 'Biaya jabatan (5%, maksimal Rp 6.000.000/tahun)', 'accupro' ),
					'Classes filed' => __( 'Jumlah kelas didaftarkan', 'accupro' ),
					'Construction execution — certified/qualified contractor' => __( 'Pelaksanaan konstruksi — kontraktor bersertifikat', 'accupro' ),
					'Construction execution — no certification' => __( 'Pelaksanaan konstruksi — tanpa sertifikat', 'accupro' ),
					'Construction execution — small qualified contractor' => __( 'Pelaksanaan konstruksi — kualifikasi kecil', 'accupro' ),
					'Construction planning/supervision — qualified' => __( 'Perencanaan/pengawasan konstruksi — bersertifikat', 'accupro' ),
					'Construction planning/supervision — unqualified' => __( 'Perencanaan/pengawasan konstruksi — tanpa sertifikat', 'accupro' ),
					'DJKI fees are set by regulation and may change — this uses the last figure Accupro confirmed.' => __( 'Tarif DJKI ditetapkan peraturan dan bisa berubah — angka ini yang terakhir dikonfirmasi Accupro.', 'accupro' ),
					'DJKI official fee (per class)' => __( 'Biaya resmi DJKI (per kelas)', 'accupro' ),
					'Dividends' => __( 'Dividen', 'accupro' ),
					'Effective rate' => __( 'Tarif efektif', 'accupro' ),
					'Entity type' => __( 'Bentuk badan usaha', 'accupro' ),
					'Estimated timeline' => __( 'Perkiraan waktu proses', 'accupro' ),
					'Estimated timeline from application to a printed KITAS card, assuming documents are complete on first submission.' => __( 'Perkiraan waktu dari pengajuan sampai kartu KITAS tercetak, dengan asumsi dokumen lengkap sejak awal.', 'accupro' ),
					'Facility applied' => __( 'Fasilitas yang dipakai', 'accupro' ),
					'Facility portion (50% off)' => __( 'Bagian berfasilitas (potongan 50%)', 'accupro' ),
					'Final rate' => __( 'Tarif final', 'accupro' ),
					'Full-rate portion' => __( 'Bagian bertarif penuh', 'accupro' ),
					'Gross amount' => __( 'Jumlah bruto', 'accupro' ),
					'Gross annual income' => __( 'Penghasilan bruto setahun', 'accupro' ),
					'Gross monthly income' => __( 'Penghasilan bruto per bulan', 'accupro' ),
					'Income type' => __( 'Jenis penghasilan', 'accupro' ),
					'Interest / loan guarantee reward' => __( 'Bunga / imbalan penjaminan pinjaman', 'accupro' ),
					'MSME final tax is calculated on gross turnover, not taxable income — the taxable income field above is not used for this option.' => __( 'Pajak final UMKM dihitung dari peredaran bruto, bukan penghasilan kena pajak — kolom penghasilan kena pajak di atas tidak dipakai untuk pilihan ini.', 'accupro' ),
					'MSME final tax regime' => __( 'Rezim pajak final UMKM', 'accupro' ),
					'NIB / OSS processing' => __( 'Pengurusan NIB / OSS', 'accupro' ),
					'NPWP status' => __( 'Status NPWP', 'accupro' ),
					'Net taxable income' => __( 'Penghasilan kena pajak neto', 'accupro' ),
					'None — turnover above Rp 50 billion' => __( 'Tidak ada — peredaran di atas Rp 50 miliar', 'accupro' ),
					'Notary & deed of establishment' => __( 'Notaris & akta pendirian', 'accupro' ),
					'Official fees total' => __( 'Total biaya resmi', 'accupro' ),
					'Other services (PMK 141/2015 list)' => __( 'Jasa lain (daftar PMK 141/2015)', 'accupro' ),
					'PTKP status' => __( 'Status PTKP', 'accupro' ),
					'Paid-up capital (' => __( 'Modal disetor (', 'accupro' ),
					'Prizes and awards (not via PPh 21)' => __( 'Hadiah dan penghargaan (bukan lewat PPh 21)', 'accupro' ),
					'Progressive rates: 5% to Rp 60M, 15% to Rp 250M, 25% to Rp 500M, 30% to Rp 5B, 35% above.' => __( 'Tarif progresif: 5% sampai Rp 60 juta, 15% sampai Rp 250 juta, 25% sampai Rp 500 juta, 30% sampai Rp 5 miliar, 35% di atasnya.', 'accupro' ),
					'RPTKA approval' => __( 'Pengesahan RPTKA', 'accupro' ),
					'Rent of assets (other than land/buildings)' => __( 'Sewa harta (selain tanah/bangunan)', 'accupro' ),
					'Rent of land / buildings' => __( 'Sewa tanah / bangunan', 'accupro' ),
					'Royalties' => __( 'Royalti', 'accupro' ),
					'Sale/transfer of land or buildings (general)' => __( 'Pengalihan tanah atau bangunan (umum)', 'accupro' ),
					'Sale/transfer — simple housing (RSS/RS) by a developer' => __( 'Pengalihan — rumah sederhana (RSS/RS) oleh pengembang', 'accupro' ),
					'Shareholder register showing paid-up capital' => __( 'Daftar pemegang saham yang menunjukkan modal disetor', 'accupro' ),
					'TER already accounts for PTKP — this is the full monthly withholding, no further PTKP deduction needed.' => __( 'TER sudah memperhitungkan PTKP — ini potongan bulanan penuh, tidak perlu dikurangi PTKP lagi.', 'accupro' ),
					'TER category' => __( 'Kategori TER', 'accupro' ),
					'Tax base' => __( 'Dasar pengenaan pajak', 'accupro' ),
					'Technical, management or consulting fees' => __( 'Jasa teknik, manajemen, atau konsultan', 'accupro' ),
					'This assumes standard registration status — ask us if any of these have been formally waived or deferred for your entity.' => __( 'Ini mengasumsikan status pendaftaran standar — tanyakan kepada kami bila ada kewajiban yang secara resmi dibebaskan atau ditangguhkan untuk badan usaha Anda.', 'accupro' ),
					'This is a final tax (PPh Final) — it is not creditable against annual PPh Badan/21 like PPh 23 is.' => __( 'Ini pajak final (PPh Final) — tidak bisa dikreditkan terhadap PPh Badan/21 tahunan seperti halnya PPh 23.', 'accupro' ),
					'Transaction type' => __( 'Jenis transaksi', 'accupro' ),
					'(gross turnover)' => __( '(peredaran bruto)', 'accupro' ),
					'(taxable income)' => __( '(penghasilan kena pajak)', 'accupro' ),
					'%d obligation this month'  => __( '%d kewajiban bulan ini', 'accupro' ),
					'%d obligations this month' => __( '%d kewajiban bulan ini', 'accupro' ),
					'Obligation %d'             => __( 'Kewajiban %d', 'accupro' ),
					'%d weeks'      => __( '%d minggu', 'accupro' ),
					'Document %d'   => __( 'Dokumen %d', 'accupro' ),
					'Registered'    => __( 'Ber-NPWP', 'accupro' ),
					'Not registered — rate doubled' => __( 'Tidak ber-NPWP — tarif dua kali lipat', 'accupro' ),
					'%1 standard, %2 on the facility portion' => __( '%1 standar, %2 untuk bagian berfasilitas', 'accupro' ),
					'RPTKA approval'                => __( 'Pengesahan RPTKA', 'accupro' ),
					'Work permit notification'      => __( 'Notifikasi izin kerja', 'accupro' ),
					'Sponsor letter from the company' => __( 'Surat sponsor dari perusahaan', 'accupro' ),
					'Passport valid 18+ months'     => __( 'Paspor berlaku minimal 18 bulan', 'accupro' ),
					'DPKK payment proof'            => __( 'Bukti pembayaran DPKK', 'accupro' ),
					'Shareholder register showing paid-up capital' => __( 'Daftar pemegang saham yang menunjukkan modal disetor', 'accupro' ),
					"Company's deed of establishment" => __( 'Akta pendirian perusahaan', 'accupro' ),
					'Proof of paid-up capital matching shareholding' => __( 'Bukti modal disetor sesuai kepemilikan saham', 'accupro' ),
					"Sponsor's valid KITAS"         => __( 'KITAS sponsor yang masih berlaku', 'accupro' ),
					'Marriage certificate (legalised if issued abroad)' => __( 'Akta nikah (dilegalisasi bila terbit di luar negeri)', 'accupro' ),
					"Children's birth certificates, if applicable" => __( 'Akta kelahiran anak, bila ada', 'accupro' ),
					'Passports valid 18+ months for each family member' => __( 'Paspor tiap anggota keluarga berlaku minimal 18 bulan', 'accupro' ),
					'PPh 25 — monthly instalment, due the 15th' => __( 'PPh 25 — angsuran bulanan, jatuh tempo tanggal 15', 'accupro' ),
					'PPh 21 — if the company has employees, due the 10th (deposit) / 20th (report)' => __( 'PPh 21 — bila perusahaan punya karyawan, setor tanggal 10 / lapor tanggal 20', 'accupro' ),
					'PPh 23 — if any applicable transactions occurred, due the 10th (deposit) / 20th (report)' => __( 'PPh 23 — bila ada transaksi terkait, setor tanggal 10 / lapor tanggal 20', 'accupro' ),
					'PPh 21 — if self-employed with no employer withholding, due the 15th' => __( 'PPh 21 — bila berusaha sendiri tanpa pemotongan pemberi kerja, jatuh tempo tanggal 15', 'accupro' ),
					'PPN — monthly VAT return, due the end of the following month' => __( 'PPN — SPT Masa PPN, jatuh tempo akhir bulan berikutnya', 'accupro' ),
				),
			)
		);

		$config = get_post_meta( get_the_ID(), 'accupro_tool_config', true );

		// Sudah divalidasi sebagai JSON saat disimpan (lihat inc/metaboxes.php
		// di plugin), jadi aman dipasang apa adanya sebagai objek.
		if ( $config ) {
			wp_add_inline_script( 'accupro-calculators', 'window.TOOL_CONFIG = ' . $config . ';', 'before' );
		}
	}
}
add_action( 'wp_enqueue_scripts', 'accupro_enqueue_assets' );

/**
 * Kelas body tambahan supaya CSS bisa membedakan halaman depan dari lainnya.
 *
 * @param string[] $classes Kelas yang sudah ada.
 * @return string[]
 */
function accupro_body_class( $classes ) {
	if ( ! is_front_page() ) {
		$classes[] = 'has-pagebanner';
	}

	return $classes;
}
add_filter( 'body_class', 'accupro_body_class' );

/**
 * Peringatan di admin kalau plugin Accupro Core belum aktif.
 *
 * Tanpa plugin itu tema kehilangan seluruh sumber kontennya, jadi lebih baik
 * dikatakan terus terang daripada tampil kosong tanpa penjelasan.
 */
function accupro_require_core_notice() {
	if ( function_exists( 'accupro_get_option' ) ) {
		return;
	}

	if ( ! current_user_can( 'activate_plugins' ) ) {
		return;
	}

	echo '<div class="notice notice-error"><p>'
		. esc_html__( 'Tema Accupro membutuhkan plugin "Accupro Core". Aktifkan plugin tersebut agar layanan, testimoni, alat hitung, dan pengaturan section bisa tampil.', 'accupro' )
		. '</p></div>';
}
add_action( 'admin_notices', 'accupro_require_core_notice' );

/**
 * Panjang ringkasan otomatis untuk kartu artikel.
 *
 * @return int
 */
function accupro_excerpt_length() {
	return 24;
}
add_filter( 'excerpt_length', 'accupro_excerpt_length' );

/**
 * Ganti "[...]" bawaan dengan elipsis biasa.
 *
 * @return string
 */
function accupro_excerpt_more() {
	return '…';
}
add_filter( 'excerpt_more', 'accupro_excerpt_more' );

/**
 * Matikan pemilih bahasa mengambang milik TranslatePress.
 *
 * Tema sudah menampilkan pemilih bahasa di header, dan yang mengambang muncul
 * di pojok kanan bawah — tepat menumpuk tombol WhatsApp. Dua tombol bulat yang
 * saling menimpa di sudut yang sama membuat keduanya sulit ditekan.
 *
 * Dicabut lewat hook, bukan lewat pengaturan plugin, supaya keputusan ini ikut
 * berpindah bersama tema dan tidak hilang kalau pengaturan TranslatePress
 * disimpan ulang dari dasbor.
 */
function accupro_remove_trp_floater() {
	if ( ! class_exists( 'TRP_Translate_Press' ) ) {
		return;
	}

	foreach ( array( 'TRP_Language_Switcher_V2', 'TRP_Language_Switcher' ) as $class ) {
		if ( ! class_exists( $class ) ) {
			continue;
		}

		foreach ( array( 'render_floater', 'add_floater_language_switcher' ) as $method ) {
			accupro_remove_object_hook( 'wp_footer', $class, $method );
		}
	}
}
add_action( 'wp_head', 'accupro_remove_trp_floater', 1 );

/**
 * Lepas satu callback objek dari sebuah hook tanpa memegang instansinya.
 *
 * remove_action() butuh objek yang sama persis. Plugin ini menyimpan
 * instansinya di dalam dirinya sendiri, jadi callback-nya dicari lewat nama
 * kelas dan nama metode.
 *
 * @param string $hook   Nama hook.
 * @param string $class  Nama kelas.
 * @param string $method Nama metode.
 */
function accupro_remove_object_hook( $hook, $class, $method ) {
	global $wp_filter;

	if ( empty( $wp_filter[ $hook ] ) ) {
		return;
	}

	foreach ( $wp_filter[ $hook ]->callbacks as $priority => $callbacks ) {
		foreach ( $callbacks as $id => $callback ) {
			if ( ! is_array( $callback['function'] ) || ! is_object( $callback['function'][0] ) ) {
				continue;
			}

			if ( $callback['function'][0] instanceof $class && $callback['function'][1] === $method ) {
				unset( $wp_filter[ $hook ]->callbacks[ $priority ][ $id ] );
			}
		}
	}
}
