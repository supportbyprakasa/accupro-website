<?php
/**
 * Pemilih gambar di admin.
 *
 * Field gambar tetap menyimpan ID lampiran seperti biasa, tapi editor tidak
 * perlu tahu angkanya: tombol di bawah membuka Media Library dan mengisi
 * angkanya sendiri. Input angkanya sengaja tidak dihapus — kalau JavaScript
 * gagal dimuat, field-nya masih bisa diisi manual, bukan jadi mati total.
 *
 * @package Accupro
 */

defined( 'ABSPATH' ) || exit;

/**
 * Render satu field gambar.
 *
 * @param string $name  Atribut name lengkap, mis. accupro_settings[hero_slides][0][image].
 * @param int    $value ID lampiran saat ini.
 */
function accupro_media_field( $name, $value ) {
	$value = (int) $value;
	$thumb = $value ? wp_get_attachment_image( $value, 'thumbnail', false, array( 'style' => 'display:block;max-width:80px;height:auto' ) ) : '';
	?>
	<div class="accupro-media">
		<div class="accupro-media__preview"><?php echo $thumb; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></div>
		<p style="margin:6px 0">
			<button type="button" class="button accupro-media__pick"><?php esc_html_e( 'Pilih gambar', 'accupro' ); ?></button>
			<button type="button" class="button-link accupro-media__clear" style="margin-left:6px<?php echo $value ? '' : ';display:none'; ?>"><?php esc_html_e( 'Hapus', 'accupro' ); ?></button>
		</p>
		<input type="number" min="0" class="small-text accupro-media__id" name="<?php echo esc_attr( $name ); ?>" value="<?php echo $value ? esc_attr( $value ) : ''; ?>">
	</div>
	<?php
}

/**
 * Muat wp.media dan skrip pemilih hanya di layar yang memakainya.
 *
 * @param string $hook Hook suffix layar admin.
 */
function accupro_admin_media_assets( $hook ) {
	$screen = function_exists( 'get_current_screen' ) ? get_current_screen() : null;

	$is_settings = false !== strpos( $hook, 'accupro' );
	$is_term     = $screen && isset( $screen->taxonomy ) && 'kategori_layanan' === $screen->taxonomy;

	if ( ! $is_settings && ! $is_term ) {
		return;
	}

	wp_enqueue_media();

	wp_enqueue_script(
		'accupro-admin-media',
		ACCUPRO_CORE_URL . 'assets/admin-media.js',
		array( 'jquery' ),
		ACCUPRO_CORE_VERSION,
		true
	);

	wp_localize_script(
		'accupro-admin-media',
		'accuproMedia',
		array(
			'title'  => __( 'Pilih gambar', 'accupro' ),
			'button' => __( 'Gunakan gambar ini', 'accupro' ),
		)
	);
}
add_action( 'admin_enqueue_scripts', 'accupro_admin_media_assets' );
