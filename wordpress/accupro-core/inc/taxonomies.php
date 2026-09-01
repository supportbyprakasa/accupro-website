<?php
/**
 * Taxonomy kategori layanan.
 *
 * Lima kategori (Pajak & Pelaporan, Registrasi, Legalitas, Izin Tinggal,
 * Merek & HKI) memakai taxonomy, bukan hardcode, supaya bisa ditambah atau
 * diurutkan ulang dari admin tanpa menyentuh kode.
 *
 * @package Accupro
 */

defined( 'ABSPATH' ) || exit;

/**
 * Daftarkan taxonomy.
 */
function accupro_register_taxonomies() {

	register_taxonomy(
		'kategori_layanan',
		array( 'layanan' ),
		array(
			'labels'            => array(
				'name'              => __( 'Kategori Layanan', 'accupro' ),
				'singular_name'     => __( 'Kategori Layanan', 'accupro' ),
				'search_items'      => __( 'Cari Kategori', 'accupro' ),
				'all_items'         => __( 'Semua Kategori', 'accupro' ),
				'edit_item'         => __( 'Edit Kategori', 'accupro' ),
				'update_item'       => __( 'Perbarui Kategori', 'accupro' ),
				'add_new_item'      => __( 'Tambah Kategori Baru', 'accupro' ),
				'new_item_name'     => __( 'Nama Kategori Baru', 'accupro' ),
				'menu_name'         => __( 'Kategori Layanan', 'accupro' ),
				'back_to_items'     => __( 'Kembali ke Kategori', 'accupro' ),
			),
			'hierarchical'      => true,
			'public'            => true,
			'show_admin_column' => true,
			'show_in_rest'      => true,
			'rewrite'           => array(
				'slug'       => 'layanan-kategori',
				'with_front' => false,
			),
		)
	);
}
add_action( 'init', 'accupro_register_taxonomies' );

/**
 * Field tambahan pada form kategori: ikon dan gambar.
 *
 * @param WP_Term|string $term Term yang diedit, atau nama taxonomy saat form tambah.
 */
function accupro_taxonomy_fields( $term ) {
	$is_edit  = is_object( $term );
	$icon     = $is_edit ? get_term_meta( $term->term_id, 'accupro_icon', true ) : '';
	$image_id = $is_edit ? (int) get_term_meta( $term->term_id, 'accupro_image_id', true ) : 0;

	$icons = accupro_icon_choices();

	if ( $is_edit ) {
		?>
		<tr class="form-field">
			<th scope="row"><label for="accupro_icon"><?php esc_html_e( 'Ikon', 'accupro' ); ?></label></th>
			<td>
				<select name="accupro_icon" id="accupro_icon">
					<?php foreach ( $icons as $key => $label ) : ?>
						<option value="<?php echo esc_attr( $key ); ?>" <?php selected( $icon, $key ); ?>><?php echo esc_html( $label ); ?></option>
					<?php endforeach; ?>
				</select>
				<p class="description"><?php esc_html_e( 'Ikon yang tampil di kartu kategori.', 'accupro' ); ?></p>
			</td>
		</tr>
		<tr class="form-field">
			<th scope="row"><?php esc_html_e( 'Gambar kategori', 'accupro' ); ?></th>
			<td>
				<?php accupro_media_field( 'accupro_image_id', $image_id ); ?>
				<p class="description"><?php esc_html_e( 'Tampil di kartu kategori dan di bagian atas halaman kategori. Kosongkan bila belum ada.', 'accupro' ); ?></p>
			</td>
		</tr>
		<?php
		return;
	}
	?>
	<div class="form-field">
		<label for="accupro_icon"><?php esc_html_e( 'Ikon', 'accupro' ); ?></label>
		<select name="accupro_icon" id="accupro_icon">
			<?php foreach ( $icons as $key => $label ) : ?>
				<option value="<?php echo esc_attr( $key ); ?>"><?php echo esc_html( $label ); ?></option>
			<?php endforeach; ?>
		</select>
	</div>
	<div class="form-field">
		<label><?php esc_html_e( 'Gambar kategori', 'accupro' ); ?></label>
		<?php accupro_media_field( 'accupro_image_id', 0 ); ?>
	</div>
	<?php
}
add_action( 'kategori_layanan_add_form_fields', 'accupro_taxonomy_fields' );
add_action( 'kategori_layanan_edit_form_fields', 'accupro_taxonomy_fields' );

/**
 * Simpan field kategori.
 *
 * @param int $term_id Term ID.
 */
function accupro_save_taxonomy_fields( $term_id ) {
	// Nonce form taxonomy sudah diperiksa core lewat check_admin_referer.
	if ( ! current_user_can( 'manage_categories' ) ) {
		return;
	}

	if ( isset( $_POST['accupro_icon'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Missing
		update_term_meta( $term_id, 'accupro_icon', sanitize_key( wp_unslash( $_POST['accupro_icon'] ) ) ); // phpcs:ignore WordPress.Security.NonceVerification.Missing
	}

	if ( isset( $_POST['accupro_image_id'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Missing
		update_term_meta( $term_id, 'accupro_image_id', absint( wp_unslash( $_POST['accupro_image_id'] ) ) ); // phpcs:ignore WordPress.Security.NonceVerification.Missing
	}
}
add_action( 'created_kategori_layanan', 'accupro_save_taxonomy_fields' );
add_action( 'edited_kategori_layanan', 'accupro_save_taxonomy_fields' );

/**
 * Pilihan ikon yang tersedia di tema.
 *
 * Nilai harus sama dengan kunci di assets/js — lihat inc/icons.php di tema.
 *
 * @return array<string,string>
 */
function accupro_icon_choices() {
	return array(
		'chart'    => __( 'Grafik (pajak & pelaporan)', 'accupro' ),
		'file'     => __( 'Dokumen (registrasi)', 'accupro' ),
		'building' => __( 'Gedung (legalitas)', 'accupro' ),
		'plane'    => __( 'Pesawat (izin tinggal & visa)', 'accupro' ),
		'badge'    => __( 'Lencana (merek & HKI)', 'accupro' ),
		'book'     => __( 'Buku (pembukuan)', 'accupro' ),
		'scale'    => __( 'Timbangan (hukum)', 'accupro' ),
		'calc'     => __( 'Kalkulator', 'accupro' ),
		'spark'    => __( 'Percikan (unggulan)', 'accupro' ),
		'users'    => __( 'Orang', 'accupro' ),
		'doc'      => __( 'Berkas', 'accupro' ),
		'clock'    => __( 'Jam', 'accupro' ),
		'pin'      => __( 'Lokasi', 'accupro' ),
	);
}
