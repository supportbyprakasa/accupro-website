<?php
/**
 * Daftar alat hitung.
 *
 * Dipisah dua: kalkulator pajak memakai tarif resmi, simulator memakai angka
 * bisnis Accupro sendiri. Pemisahan itu penting supaya pengunjung tahu mana
 * yang bisa dijadikan acuan tarif dan mana yang sekadar perkiraan biaya.
 *
 * @package Accupro
 */

defined( 'ABSPATH' ) || exit;

get_header();
?>

<main id="main">
	<?php
	accupro_page_banner(
		array(
			'crumbs'  => array(
				array(
					'label' => __( 'Beranda', 'accupro' ),
					'url'   => home_url( '/' ),
				),
				array( 'label' => __( 'Alat Hitung', 'accupro' ) ),
			),
			'kicker'  => '<span class="eyebrow">' . esc_html__( 'Gratis, tanpa daftar', 'accupro' ) . '</span>',
			'heading' => post_type_archive_title( '', false ),
			'lede'    => __( 'Hitung perkiraan pajak dan biaya pengurusan langsung di browser Anda. Tidak ada angka yang dikirim ke server kami.', 'accupro' ),
			'media'   => accupro_default_banner( __( 'Ilustrasi alat hitung', 'accupro' ) ),
		)
	);
	?>

	<?php
	$accupro_tax = do_shortcode( '[accupro_alat jenis="tax"]' );
	if ( trim( $accupro_tax ) ) :
		?>
		<section class="section">
			<div class="container">
				<span class="eyebrow"><?php esc_html_e( 'Tarif resmi', 'accupro' ); ?></span>
				<h2 style="margin:8px 0 clamp(20px,3vw,32px)"><?php esc_html_e( 'Kalkulator pajak', 'accupro' ); ?></h2>
				<?php echo $accupro_tax; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
			</div>
		</section>
	<?php endif; ?>

	<?php
	$accupro_own = do_shortcode( '[accupro_alat jenis="own"]' );
	if ( trim( $accupro_own ) ) :
		?>
		<section class="section section--surface">
			<div class="container">
				<span class="eyebrow eyebrow--gold"><?php esc_html_e( 'Angka Accupro', 'accupro' ); ?></span>
				<h2 style="margin:8px 0 clamp(20px,3vw,32px)"><?php esc_html_e( 'Simulator biaya & persyaratan', 'accupro' ); ?></h2>
				<?php echo $accupro_own; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
			</div>
		</section>
	<?php endif; ?>

	<?php accupro_cta_band(); ?>
</main>

<?php
get_footer();
