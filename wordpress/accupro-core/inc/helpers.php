<?php
/**
 * Helper yang dipakai bersama oleh plugin dan tema.
 *
 * Fungsi di sini sengaja diberi prefix accupro_ dan dicek dengan
 * function_exists() di tema, supaya tema tidak fatal error kalau plugin
 * kebetulan dinonaktifkan.
 *
 * @package Accupro
 */

defined( 'ABSPATH' ) || exit;

/**
 * Ambil satu opsi Accupro.
 *
 * Semua pengaturan disimpan dalam satu option array ('accupro_settings')
 * daripada puluhan row terpisah — satu kali query, dan mudah di-export.
 *
 * @param string $key     Kunci pengaturan.
 * @param mixed  $default Nilai bila kosong.
 * @return mixed
 */
function accupro_get_option( $key, $default = '' ) {
	static $settings = null;

	if ( null === $settings ) {
		$settings = get_option( 'accupro_settings', array() );
		if ( ! is_array( $settings ) ) {
			$settings = array();
		}
	}

	if ( ! isset( $settings[ $key ] ) || '' === $settings[ $key ] ) {
		return $default;
	}

	return $settings[ $key ];
}

/**
 * Ambil satu grup berulang (hero slides, pilar, statistik, dst).
 *
 * @param string $key Kunci grup.
 * @return array Selalu array, walau kosong.
 */
function accupro_get_group( $key ) {
	$value = accupro_get_option( $key, array() );
	return is_array( $value ) ? $value : array();
}

/**
 * Nomor WhatsApp dalam format internasional untuk tautan wa.me.
 *
 * @return string Hanya digit, tanpa + atau spasi.
 */
function accupro_whatsapp_intl() {
	$raw = accupro_get_option( 'whatsapp', '' );
	$raw = preg_replace( '/\D+/', '', $raw );

	if ( '' === $raw ) {
		return '';
	}

	// 08xx -> 628xx; 62xx dibiarkan; sisanya dianggap sudah benar.
	if ( 0 === strpos( $raw, '0' ) ) {
		$raw = '62' . substr( $raw, 1 );
	}

	return $raw;
}

/**
 * URL wa.me lengkap, atau string kosong bila nomor belum diisi.
 *
 * @return string
 */
function accupro_whatsapp_url() {
	$intl = accupro_whatsapp_intl();
	return $intl ? 'https://wa.me/' . $intl : '';
}

/**
 * Bersihkan nomor telepon untuk atribut href="tel:".
 *
 * @param string $phone Nomor apa adanya.
 * @return string
 */
function accupro_tel( $phone ) {
	return preg_replace( '/[^\d+]/', '', (string) $phone );
}

/**
 * Daftar kanal sosial yang terisi saja.
 *
 * @return array<string,string> label => url
 */
function accupro_social_links() {
	$map = array(
		'instagram' => __( 'Instagram', 'accupro' ),
		'facebook'  => __( 'Facebook', 'accupro' ),
		'linkedin'  => __( 'LinkedIn', 'accupro' ),
		'tiktok'    => __( 'TikTok', 'accupro' ),
	);

	$out = array();
	foreach ( $map as $key => $label ) {
		$url = accupro_get_option( 'social_' . $key, '' );
		if ( $url ) {
			$out[ $key ] = array(
				'label' => $label,
				'url'   => $url,
			);
		}
	}

	return $out;
}

/**
 * Ambil layanan berdasarkan kategori.
 *
 * @param int|string $term Term ID atau slug kategori layanan.
 * @param int        $limit Jumlah maksimum; -1 untuk semua.
 * @return WP_Post[]
 */
function accupro_get_services( $term = 0, $limit = -1 ) {
	$args = array(
		'post_type'      => 'layanan',
		'posts_per_page' => $limit,
		'orderby'        => 'menu_order title',
		'order'          => 'ASC',
		'no_found_rows'  => true,
	);

	if ( $term ) {
		$args['tax_query'] = array( // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_tax_query
			array(
				'taxonomy' => 'kategori_layanan',
				'field'    => is_numeric( $term ) ? 'term_id' : 'slug',
				'terms'    => $term,
			),
		);
	}

	return get_posts( $args );
}

/**
 * Jumlah layanan dalam satu kategori.
 *
 * @param WP_Term $term Term kategori layanan.
 * @return int
 */
function accupro_service_count( $term ) {
	return isset( $term->count ) ? (int) $term->count : 0;
}

/**
 * Daftar layanan untuk dropdown di admin: post ID => judul.
 *
 * Di-cache statis karena dipanggil beberapa kali dalam satu request admin
 * (render metabox lalu simpan).
 *
 * @return array<string,string>
 */
function accupro_service_options() {
	static $options = null;

	if ( null !== $options ) {
		return $options;
	}

	$options = array( '' => __( '— tidak ada —', 'accupro' ) );

	foreach ( accupro_get_services() as $service ) {
		$options[ (string) $service->ID ] = $service->post_title;
	}

	return $options;
}
