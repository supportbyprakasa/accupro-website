<?php
/**
 * Daftar seluruh layanan, dikelompokkan per kategori.
 *
 * Pencarian dan filter kategori berjalan di sisi klien (assets/js/main.js)
 * lewat atribut data-name / data-cat, jadi daftar tidak perlu memuat ulang
 * halaman tiap kali disaring.
 *
 * @package Accupro
 */

defined( 'ABSPATH' ) || exit;

get_header();

$accupro_cats  = accupro_categories();
$accupro_total = wp_count_posts( 'layanan' );
$accupro_total = $accupro_total ? (int) $accupro_total->publish : 0;
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
				array( 'label' => __( 'Layanan', 'accupro' ) ),
			),
			'kicker'  => '<span class="eyebrow">' . esc_html__( 'Katalog layanan', 'accupro' ) . '</span>',
			'heading' => post_type_archive_title( '', false ),
			'lede'    => sprintf(
				/* translators: %s: jumlah layanan. */
				esc_html( _n( '%s layanan siap kami tangani, dikelompokkan per bidang.', '%s layanan siap kami tangani, dikelompokkan per bidang.', $accupro_total, 'accupro' ) ),
				esc_html( number_format_i18n( $accupro_total ) )
			),
			'extra'   => '',
			'media'   => accupro_default_banner( __( 'Foto tim Accupro', 'accupro' ) ),
		)
	);
	?>

	<section class="section" id="service-index">
		<div class="container">
			<form class="card card--pad" role="search" style="margin-bottom:clamp(20px,3vw,32px)">
				<label class="field">
					<span class="field__label"><?php esc_html_e( 'Cari layanan', 'accupro' ); ?></span>
					<input class="field__input" type="search" id="service-search" placeholder="<?php esc_attr_e( 'Ketik nama layanan…', 'accupro' ); ?>">
				</label>
				<div class="cluster" style="margin-top:14px">
					<button class="chip" type="button" data-filter="all" aria-pressed="true"><?php esc_html_e( 'Semua', 'accupro' ); ?></button>
					<?php foreach ( $accupro_cats as $accupro_cat ) : ?>
						<button class="chip" type="button" data-filter="<?php echo esc_attr( $accupro_cat->slug ); ?>" aria-pressed="false"><?php echo esc_html( $accupro_cat->name ); ?></button>
					<?php endforeach; ?>
				</div>
			</form>

			<?php foreach ( $accupro_cats as $accupro_cat ) : ?>
				<?php $accupro_items = accupro_get_services( $accupro_cat->slug ); ?>
				<?php if ( ! $accupro_items ) : ?>
					<?php continue; ?>
				<?php endif; ?>

				<div data-group="<?php echo esc_attr( $accupro_cat->slug ); ?>" style="margin-bottom:clamp(28px,4vw,44px)">
					<div class="between" style="margin-bottom:16px">
						<div class="cluster" style="gap:10px">
							<span style="color:var(--navy)"><?php echo accupro_icon( get_term_meta( $accupro_cat->term_id, 'accupro_icon', true ) ?: 'chart', 20 ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped, Universal.Operators.DisallowShortTernary.Found ?></span>
							<h2><?php echo esc_html( $accupro_cat->name ); ?></h2>
						</div>
						<a class="btn btn--quiet btn--sm" href="<?php echo esc_url( get_term_link( $accupro_cat ) ); ?>">
							<?php esc_html_e( 'Buka bidang', 'accupro' ); ?> <?php echo accupro_icon( 'arrow', 15 ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
						</a>
					</div>

					<div class="grid g3">
						<?php foreach ( $accupro_items as $accupro_item ) : ?>
							<a class="card card--link card--pad"
								href="<?php echo esc_url( get_permalink( $accupro_item ) ); ?>"
								data-name="<?php echo esc_attr( get_the_title( $accupro_item ) ); ?>"
								data-cat="<?php echo esc_attr( $accupro_cat->slug ); ?>">
								<h3><?php echo esc_html( get_the_title( $accupro_item ) ); ?></h3>
								<p class="small" style="margin-top:8px"><?php echo esc_html( accupro_summary( $accupro_item ) ); ?></p>
								<span class="card__more"><?php esc_html_e( 'Lihat detail', 'accupro' ); ?> <?php echo accupro_icon( 'arrow', 16 ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></span>
							</a>
						<?php endforeach; ?>
					</div>
				</div>
			<?php endforeach; ?>

			<p class="lede" id="service-empty" hidden><?php esc_html_e( 'Tidak ada layanan yang cocok dengan pencarian itu. Coba kata kunci lain, atau hubungi kami — kami bantu carikan yang tepat.', 'accupro' ); ?></p>
		</div>
	</section>

	<?php accupro_cta_band(); ?>
</main>

<?php
get_footer();
