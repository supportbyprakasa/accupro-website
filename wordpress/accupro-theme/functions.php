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
