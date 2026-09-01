<?php
/**
 * Daftar periksa setelah pemasangan.
 *
 * Aktivasi mengisi seluruh teks, tapi tidak bisa menebak gambar mana di Media
 * Library yang dimaksud. Tanpa pengingat, situs gampang terlanjur tayang
 * dengan kotak placeholder di hero dan logo bawaan tema — kegagalan yang
 * paling mungkin terjadi dan paling terlihat.
 *
 * Pemberitahuan ini hilang sendiri begitu semuanya terisi, dan bisa ditutup
 * permanen kalau memang disengaja dibiarkan kosong.
 *
 * @package Accupro
 */

defined( 'ABSPATH' ) || exit;

/**
 * Hal yang masih perlu diisi manual.
 *
 * @return array<string,string> label => url pengaturan
 */
function accupro_setup_todo() {
	$todo = array();

	if ( ! accupro_get_option( 'logo_image', 0 ) && ! get_theme_mod( 'custom_logo' ) ) {
		$todo[ __( 'Logo situs belum dipilih', 'accupro' ) ] = admin_url( 'admin.php?page=accupro' );
	}

	$slides  = accupro_get_group( 'hero_slides' );
	$no_img  = 0;
	foreach ( $slides as $slide ) {
		if ( ! empty( $slide['headline'] ) && empty( $slide['image'] ) ) {
			$no_img++;
		}
	}
	if ( $no_img ) {
		$todo[ sprintf(
			/* translators: %d: jumlah slide tanpa gambar. */
			_n( '%d slide hero belum punya gambar', '%d slide hero belum punya gambar', $no_img, 'accupro' ),
			$no_img
		) ] = admin_url( 'admin.php?page=accupro-home' );
	}

	if ( ! accupro_get_option( 'banner_image', 0 ) ) {
		$todo[ __( 'Gambar bawaan banner halaman belum dipilih', 'accupro' ) ] = admin_url( 'admin.php?page=accupro-home' );
	}

	if ( ! accupro_get_option( 'cta_image', 0 ) ) {
		$todo[ __( 'Gambar pendamping ajakan konsultasi belum dipilih', 'accupro' ) ] = admin_url( 'admin.php?page=accupro-home' );
	}

	return $todo;
}

/**
 * Tampilkan daftar periksa.
 */
function accupro_setup_notice() {
	if ( ! current_user_can( 'manage_options' ) ) {
		return;
	}

	if ( get_option( 'accupro_setup_dismissed' ) ) {
		return;
	}

	$todo = accupro_setup_todo();

	if ( ! $todo ) {
		return;
	}

	$dismiss = wp_nonce_url( add_query_arg( 'accupro_dismiss_setup', '1' ), 'accupro_dismiss_setup' );
	?>
	<div class="notice notice-warning">
		<p><strong><?php esc_html_e( 'Accupro — tinggal beberapa langkah lagi', 'accupro' ); ?></strong></p>
		<p><?php esc_html_e( 'Seluruh teks sudah terisi. Yang belum bisa diisi otomatis hanya gambar, karena plugin tidak tahu berkas mana di Media Library yang Anda maksud:', 'accupro' ); ?></p>
		<ul style="list-style:disc;margin-left:22px">
			<?php foreach ( $todo as $label => $url ) : ?>
				<li><a href="<?php echo esc_url( $url ); ?>"><?php echo esc_html( $label ); ?></a></li>
			<?php endforeach; ?>
		</ul>
		<p>
			<a href="<?php echo esc_url( $dismiss ); ?>" class="button-link">
				<?php esc_html_e( 'Saya sengaja membiarkannya kosong — jangan tampilkan lagi', 'accupro' ); ?>
			</a>
		</p>
	</div>
	<?php
}
add_action( 'admin_notices', 'accupro_setup_notice' );

/**
 * Simpan keputusan menutup daftar periksa.
 */
function accupro_dismiss_setup_notice() {
	if ( ! isset( $_GET['accupro_dismiss_setup'] ) ) {
		return;
	}

	if ( ! current_user_can( 'manage_options' ) ) {
		return;
	}

	check_admin_referer( 'accupro_dismiss_setup' );
	update_option( 'accupro_setup_dismissed', 1 );

	wp_safe_redirect( remove_query_arg( array( 'accupro_dismiss_setup', '_wpnonce' ) ) );
	exit;
}
add_action( 'admin_init', 'accupro_dismiss_setup_notice' );
