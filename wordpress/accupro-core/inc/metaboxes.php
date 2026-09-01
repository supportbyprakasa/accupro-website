<?php
/**
 * Metabox per-post, ditulis dengan API bawaan WordPress (tanpa ACF).
 *
 * Semua field satu post disimpan lewat satu nonce dan satu fungsi simpan,
 * supaya tidak ada kombinasi field yang lolos tanpa pengecekan izin.
 *
 * @package Accupro
 */

defined( 'ABSPATH' ) || exit;

/**
 * Definisi field per post type.
 *
 * type: text | textarea | select | number | url
 *
 * @return array<string,array>
 */
function accupro_meta_fields() {
	return array(
		'layanan'   => array(
			'accupro_shot'    => array(
				'label' => __( 'Briefing foto', 'accupro' ),
				'type'  => 'textarea',
				'desc'  => __( 'Deskripsi foto yang dibutuhkan. Juga dipakai sebagai teks alternatif gambar.', 'accupro' ),
			),
			'accupro_ringkas' => array(
				'label' => __( 'Ringkasan satu kalimat', 'accupro' ),
				'type'  => 'textarea',
				'desc'  => __( 'Tampil di kartu daftar layanan dan di bawah judul halaman layanan.', 'accupro' ),
			),
		),
		'testimoni' => array(
			'accupro_perusahaan' => array(
				'label' => __( 'Perusahaan', 'accupro' ),
				'type'  => 'text',
				'desc'  => __( 'Nama perusahaan pemberi testimoni. Kosongkan bila tidak ingin ditampilkan.', 'accupro' ),
			),
		),
		'tim'       => array(
			'accupro_jabatan' => array(
				'label' => __( 'Jabatan', 'accupro' ),
				'type'  => 'text',
				'desc'  => __( 'Contoh: Direktur, Marketing, Staff Pajak.', 'accupro' ),
			),
			'accupro_tugas'   => array(
				'label' => __( 'Layanan yang ditangani', 'accupro' ),
				'type'  => 'textarea',
				'desc'  => __( 'Kalimat singkat tentang lingkup kerjanya.', 'accupro' ),
			),
		),
		'alat'      => array(
			'accupro_tool_slug'   => array(
				'label' => __( 'Kode kalkulator', 'accupro' ),
				'type'  => 'select',
				'desc'  => __( 'Menentukan rumus mana yang dipakai. Harus cocok dengan salah satu kalkulator di calculators.js.', 'accupro' ),
				'options' => array(
					''                    => __( '— pilih —', 'accupro' ),
					'pph-badan'           => 'PPh Badan',
					'pph21-ter'           => 'PPh 21 TER',
					'pph21-masa'          => 'PPh 21 Masa/Final',
					'pph23'               => 'PPh 23',
					'pph4-2'              => 'PPh Pasal 4(2)',
					'company-setup-cost'  => __( 'Simulasi Biaya Pendirian', 'accupro' ),
					'kitas-requirements'  => __( 'Cek Syarat & Waktu KITAS', 'accupro' ),
					'trademark-cost'      => __( 'Simulasi Biaya Merek', 'accupro' ),
					'monthly-obligations' => __( 'Cek Kewajiban Bulanan', 'accupro' ),
				),
			),
			'accupro_tool_kind'   => array(
				'label'   => __( 'Jenis', 'accupro' ),
				'type'    => 'select',
				'desc'    => __( 'Kalkulator pajak memakai tarif resmi; simulator memakai angka bisnis di bawah.', 'accupro' ),
				'options' => array(
					'tax' => __( 'Kalkulator pajak (tarif resmi)', 'accupro' ),
					'own' => __( 'Simulator Accupro (angka bisnis sendiri)', 'accupro' ),
				),
			),
			'accupro_result_label' => array(
				'label' => __( 'Label hasil', 'accupro' ),
				'type'  => 'text',
				'desc'  => __( 'Teks kecil di atas angka hasil. Contoh: Pajak terutang, Estimasi total biaya.', 'accupro' ),
			),
			'accupro_bridge_post' => array(
				'label'   => __( 'Layanan terkait', 'accupro' ),
				'type'    => 'select',
				'desc'    => __( 'Layanan yang ditawarkan di kotak ajakan, tepat setelah hasil hitung.', 'accupro' ),
				'options' => accupro_service_options(),
			),
			'accupro_tool_config' => array(
				'label' => __( 'Angka bisnis (JSON)', 'accupro' ),
				'type'  => 'textarea',
				'desc'  => __( 'Hanya untuk simulator. Contoh: {"serviceFee":2500000}. Kosongkan untuk kalkulator pajak. Isi dengan JSON yang valid — kalau salah format, akan ditolak saat disimpan.', 'accupro' ),
			),
		),
	);
}

/**
 * Daftarkan metabox untuk tiap post type yang punya field.
 */
function accupro_add_meta_boxes() {
	foreach ( accupro_meta_fields() as $post_type => $fields ) {
		add_meta_box(
			'accupro_details',
			__( 'Detail Accupro', 'accupro' ),
			'accupro_render_meta_box',
			$post_type,
			'normal',
			'high'
		);
	}
}
add_action( 'add_meta_boxes', 'accupro_add_meta_boxes' );

/**
 * Render isi metabox.
 *
 * @param WP_Post $post Post yang sedang diedit.
 */
function accupro_render_meta_box( $post ) {
	$all    = accupro_meta_fields();
	$fields = isset( $all[ $post->post_type ] ) ? $all[ $post->post_type ] : array();

	if ( ! $fields ) {
		return;
	}

	wp_nonce_field( 'accupro_save_meta', 'accupro_meta_nonce' );

	echo '<table class="form-table" role="presentation"><tbody>';

	foreach ( $fields as $key => $field ) {
		$value = get_post_meta( $post->ID, $key, true );
		$type  = isset( $field['type'] ) ? $field['type'] : 'text';

		echo '<tr><th scope="row"><label for="' . esc_attr( $key ) . '">' . esc_html( $field['label'] ) . '</label></th><td>';

		if ( 'textarea' === $type ) {
			printf(
				'<textarea name="%1$s" id="%1$s" rows="3" class="large-text">%2$s</textarea>',
				esc_attr( $key ),
				esc_textarea( $value )
			);
		} elseif ( 'select' === $type ) {
			echo '<select name="' . esc_attr( $key ) . '" id="' . esc_attr( $key ) . '">';
			foreach ( $field['options'] as $opt_value => $opt_label ) {
				printf(
					'<option value="%1$s" %2$s>%3$s</option>',
					esc_attr( $opt_value ),
					selected( $value, $opt_value, false ),
					esc_html( $opt_label )
				);
			}
			echo '</select>';
		} else {
			printf(
				'<input type="%1$s" name="%2$s" id="%2$s" value="%3$s" class="regular-text">',
				esc_attr( 'url' === $type ? 'url' : 'text' ),
				esc_attr( $key ),
				esc_attr( $value )
			);
		}

		if ( ! empty( $field['desc'] ) ) {
			echo '<p class="description">' . esc_html( $field['desc'] ) . '</p>';
		}

		echo '</td></tr>';
	}

	echo '</tbody></table>';
}

/**
 * Simpan field metabox.
 *
 * @param int     $post_id Post ID.
 * @param WP_Post $post    Objek post.
 */
function accupro_save_meta( $post_id, $post ) {
	if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
		return;
	}

	if ( ! isset( $_POST['accupro_meta_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['accupro_meta_nonce'] ) ), 'accupro_save_meta' ) ) {
		return;
	}

	if ( ! current_user_can( 'edit_post', $post_id ) ) {
		return;
	}

	$all    = accupro_meta_fields();
	$fields = isset( $all[ $post->post_type ] ) ? $all[ $post->post_type ] : array();

	foreach ( $fields as $key => $field ) {
		if ( ! isset( $_POST[ $key ] ) ) {
			continue;
		}

		$raw  = wp_unslash( $_POST[ $key ] ); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
		$type = isset( $field['type'] ) ? $field['type'] : 'text';

		if ( 'accupro_tool_config' === $key ) {
			$value = accupro_sanitize_json( $raw );
		} elseif ( 'textarea' === $type ) {
			$value = sanitize_textarea_field( $raw );
		} elseif ( 'select' === $type ) {
			$value = array_key_exists( $raw, $field['options'] ) ? $raw : '';
		} elseif ( 'url' === $type ) {
			$value = esc_url_raw( $raw );
		} else {
			$value = sanitize_text_field( $raw );
		}

		update_post_meta( $post_id, $key, $value );
	}
}
add_action( 'save_post', 'accupro_save_meta', 10, 2 );

/**
 * Terima JSON hanya bila valid; kalau tidak, kembalikan string kosong supaya
 * kalkulator jatuh ke nilai bawaan alih-alih menyuntikkan data rusak ke
 * window.TOOL_CONFIG di halaman depan.
 *
 * @param string $raw Isi textarea.
 * @return string JSON ter-encode ulang, atau '' bila tidak valid.
 */
function accupro_sanitize_json( $raw ) {
	$raw = trim( (string) $raw );

	if ( '' === $raw ) {
		return '';
	}

	$decoded = json_decode( $raw, true );

	if ( null === $decoded && JSON_ERROR_NONE !== json_last_error() ) {
		return '';
	}

	return wp_json_encode( $decoded );
}
