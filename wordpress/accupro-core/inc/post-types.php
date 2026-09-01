<?php
/**
 * Custom post type.
 *
 * Slug 'layanan' sengaja dipertahankan karena 24 URL layanan di situs lama
 * sudah memakai /layanan/<slug>/ — mengubahnya akan mematikan semua tautan
 * dan peringkat pencarian yang sudah ada.
 *
 * @package Accupro
 */

defined( 'ABSPATH' ) || exit;

/**
 * Daftarkan semua post type Accupro.
 */
function accupro_register_post_types() {

	register_post_type(
		'layanan',
		array(
			'labels'        => array(
				'name'               => __( 'Layanan', 'accupro' ),
				'singular_name'      => __( 'Layanan', 'accupro' ),
				'add_new'            => __( 'Tambah Layanan', 'accupro' ),
				'add_new_item'       => __( 'Tambah Layanan Baru', 'accupro' ),
				'edit_item'          => __( 'Edit Layanan', 'accupro' ),
				'new_item'           => __( 'Layanan Baru', 'accupro' ),
				'view_item'          => __( 'Lihat Layanan', 'accupro' ),
				'search_items'       => __( 'Cari Layanan', 'accupro' ),
				'not_found'          => __( 'Belum ada layanan.', 'accupro' ),
				'all_items'          => __( 'Semua Layanan', 'accupro' ),
				'menu_name'          => __( 'Layanan', 'accupro' ),
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
		)
	);

	register_post_type(
		'testimoni',
		array(
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
		)
	);

	register_post_type(
		'tim',
		array(
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
		)
	);

	register_post_type(
		'alat',
		array(
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
		)
	);
}
add_action( 'init', 'accupro_register_post_types' );
