<?php
/**
 * Custom post type.
 *
 * Slug 'layanan' sengaja dipertahankan karena 24 URL layanan di situs lama
 * sudah memakai /layanan/<slug>/ — mengubahnya akan mematikan semua tautan
 * dan peringkat pencarian yang sudah ada.
 *
 * Penting: situs accuprointernational.co.id yang berjalan sekarang SUDAH punya
 * post type 'layanan', didaftarkan plugin lain (accupro-blocks). Dua plugin
 * yang mendaftarkan nama sama akan saling menimpa argumennya, dan yang menang
 * tergantung urutan muat — tidak bisa diandalkan. Karena itu setiap pendaftaran
 * di bawah dilewati kalau post type-nya sudah ada: post lama tetap utuh dan
 * tetap dipakai tema ini, yang ditambahkan Accupro Core hanya taxonomy dan
 * field-nya.
 *
 * @package Accupro
 */

defined( 'ABSPATH' ) || exit;

/**
 * Definisi seluruh post type Accupro.
 *
 * @return array<string,array>
 */
function accupro_post_type_args() {
	return array(

		'layanan'   => array(
			'labels'        => array(
				'name'          => __( 'Layanan', 'accupro' ),
				'singular_name' => __( 'Layanan', 'accupro' ),
				'add_new'       => __( 'Tambah Layanan', 'accupro' ),
				'add_new_item'  => __( 'Tambah Layanan Baru', 'accupro' ),
				'edit_item'     => __( 'Edit Layanan', 'accupro' ),
				'new_item'      => __( 'Layanan Baru', 'accupro' ),
				'view_item'     => __( 'Lihat Layanan', 'accupro' ),
				'search_items'  => __( 'Cari Layanan', 'accupro' ),
				'not_found'     => __( 'Belum ada layanan.', 'accupro' ),
				'all_items'     => __( 'Semua Layanan', 'accupro' ),
				'menu_name'     => __( 'Layanan', 'accupro' ),
			),
			'public'        => true,
			'has_archive'   => true,
			'menu_icon'     => 'dashicons-portfolio',
			'menu_position' => 20,
			'rewrite'       => array(
				'slug'       => 'layanan',
				'with_front' => false,
			),
			'supports'      => array( 'title', 'editor', 'excerpt', 'thumbnail', 'page-attributes' ),
			'show_in_rest'  => true,
		),

		'testimonial' => array(
			'labels'        => array(
				'name'          => __( 'Testimoni', 'accupro' ),
				'singular_name' => __( 'Testimoni', 'accupro' ),
				'add_new_item'  => __( 'Tambah Testimoni', 'accupro' ),
				'edit_item'     => __( 'Edit Testimoni', 'accupro' ),
				'all_items'     => __( 'Semua Testimoni', 'accupro' ),
				'menu_name'     => __( 'Testimoni', 'accupro' ),
			),
			'public'        => false,
			'show_ui'       => true,
			'menu_icon'     => 'dashicons-format-quote',
			'menu_position' => 21,
			// Judul dipakai sebagai nama pemberi testimoni, editor sebagai kutipannya.
			'supports'      => array( 'title', 'editor', 'page-attributes' ),
			'show_in_rest'  => true,
		),

		'team'       => array(
			'labels'        => array(
				'name'          => __( 'Tim', 'accupro' ),
				'singular_name' => __( 'Anggota Tim', 'accupro' ),
				'add_new_item'  => __( 'Tambah Anggota Tim', 'accupro' ),
				'edit_item'     => __( 'Edit Anggota Tim', 'accupro' ),
				'all_items'     => __( 'Semua Anggota Tim', 'accupro' ),
				'menu_name'     => __( 'Tim', 'accupro' ),
			),
			'public'        => false,
			'show_ui'       => true,
			'menu_icon'     => 'dashicons-groups',
			'menu_position' => 22,
			'supports'      => array( 'title', 'thumbnail', 'page-attributes' ),
			'show_in_rest'  => true,
		),

		'alat'      => array(
			'labels'        => array(
				'name'          => __( 'Alat Hitung', 'accupro' ),
				'singular_name' => __( 'Alat Hitung', 'accupro' ),
				'add_new_item'  => __( 'Tambah Alat Hitung', 'accupro' ),
				'edit_item'     => __( 'Edit Alat Hitung', 'accupro' ),
				'all_items'     => __( 'Semua Alat Hitung', 'accupro' ),
				'menu_name'     => __( 'Alat Hitung', 'accupro' ),
			),
			'public'        => true,
			'has_archive'   => true,
			'menu_icon'     => 'dashicons-calculator',
			'menu_position' => 23,
			'rewrite'       => array(
				'slug'       => 'alat',
				'with_front' => false,
			),
			'supports'      => array( 'title', 'excerpt', 'page-attributes' ),
			'show_in_rest'  => true,
		),
	);
}

/**
 * Daftarkan post type yang belum ada.
 */
function accupro_register_post_types() {
	foreach ( accupro_post_type_args() as $type => $args ) {
		if ( post_type_exists( $type ) ) {
			continue;
		}

		register_post_type( $type, $args );
	}
}
add_action( 'init', 'accupro_register_post_types' );

/**
 * Apakah post type ini yang didaftarkan Accupro Core?
 *
 * Dibedakan lewat label, karena WordPress tidak menyimpan siapa yang
 * mendaftarkan sebuah post type.
 *
 * @param string $type Nama post type.
 * @return bool
 */
function accupro_owns_post_type( $type ) {
	$object = get_post_type_object( $type );
	$args   = accupro_post_type_args();

	if ( ! $object || ! isset( $args[ $type ]['labels'] ) ) {
		return false;
	}

	$ours = $args[ $type ]['labels'];

	return isset( $object->labels->menu_name, $object->labels->add_new_item )
		&& $object->labels->menu_name === $ours['menu_name']
		&& $object->labels->add_new_item === $ours['add_new_item'];
}

/**
 * Post type mana yang dipegang plugin lain.
 *
 * Dipakai seeder untuk memutuskan mengadopsi konten yang sudah ada alih-alih
 * membuat yang baru, dan dipakai peringatan di admin.
 *
 * @return string[]
 */
function accupro_foreign_post_types() {
	$foreign = array();

	foreach ( array_keys( accupro_post_type_args() ) as $type ) {
		if ( post_type_exists( $type ) && ! accupro_owns_post_type( $type ) ) {
			$foreign[] = $type;
		}
	}

	return $foreign;
}

/**
 * Beri tahu admin kalau ada tipe konten yang dipegang plugin lain.
 *
 * Bukan error — situasi ini memang didukung — tapi perlu terlihat, supaya
 * tidak ada yang bingung kenapa label atau menu di dasbor berbeda dari yang
 * tertulis di dokumentasi Accupro.
 */
function accupro_foreign_post_type_notice() {
	if ( ! current_user_can( 'activate_plugins' ) ) {
		return;
	}

	$foreign = accupro_foreign_post_types();

	if ( ! $foreign ) {
		return;
	}

	echo '<div class="notice notice-info"><p>'
		. esc_html(
			sprintf(
				/* translators: %s: daftar nama tipe konten. */
				__( 'Accupro Core mendeteksi tipe konten yang sudah didaftarkan plugin lain: %s. Pendaftaran dari Accupro Core dilewati agar konten lama tetap utuh — tema tetap menampilkannya seperti biasa.', 'accupro' ),
				implode( ', ', $foreign )
			)
		)
		. '</p></div>';
}
add_action( 'admin_notices', 'accupro_foreign_post_type_notice' );
