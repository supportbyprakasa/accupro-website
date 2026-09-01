<?php
/**
 * Satu bidang layanan.
 *
 * @package Accupro
 */

defined( 'ABSPATH' ) || exit;

get_header();

$accupro_term  = get_queried_object();
$accupro_items = accupro_get_services( $accupro_term->slug );
$accupro_icon  = get_term_meta( $accupro_term->term_id, 'accupro_icon', true );
$accupro_count = count( $accupro_items );
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
				array(
					'label' => __( 'Layanan', 'accupro' ),
					'url'   => get_post_type_archive_link( 'layanan' ),
				),
				array( 'label' => $accupro_term->name ),
			),
			'kicker'  => '<span class="icon-lead">' . accupro_icon( $accupro_icon ? $accupro_icon : 'chart', 26 ) . '</span>',
			'heading' => $accupro_term->name,
			'lede'    => $accupro_term->description,
			'media'   => accupro_term_media( $accupro_term, '4 / 3' ),
		)
	);
	?>

	<?php if ( $accupro_items ) : ?>
		<section class="section">
			<div class="container">
				<span class="eyebrow"><?php esc_html_e( 'Layanan di bidang ini', 'accupro' ); ?></span>
				<h2 style="margin:8px 0 clamp(20px,3vw,32px)">
					<?php
					printf(
						/* translators: %s: jumlah layanan. */
						esc_html( _n( '%s layanan', '%s layanan', $accupro_count, 'accupro' ) ),
						esc_html( number_format_i18n( $accupro_count ) )
					);
					?>
				</h2>

				<div class="stack" style="--s:14px">
					<?php foreach ( $accupro_items as $accupro_item ) : ?>
						<article class="card card--link" style="overflow:hidden">
							<div class="rowcard" style="--thumb:170px">
								<div class="rowcard__media"><?php echo accupro_media( $accupro_item->ID, '1 / 1' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></div>
								<div class="rowcard__body">
									<div class="cluster" style="gap:9px">
										<span style="color:var(--navy)"><?php echo accupro_icon( $accupro_icon ? $accupro_icon : 'chart', 19 ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></span>
										<h3><a href="<?php echo esc_url( get_permalink( $accupro_item ) ); ?>"><?php echo esc_html( get_the_title( $accupro_item ) ); ?></a></h3>
									</div>
									<p class="small" style="margin-top:6px"><?php echo esc_html( accupro_summary( $accupro_item ) ); ?></p>
								</div>
								<div class="rowcard__end">
									<a class="btn btn--quiet" href="<?php echo esc_url( get_permalink( $accupro_item ) ); ?>">
										<?php esc_html_e( 'Detail', 'accupro' ); ?> <?php echo accupro_icon( 'arrow', 15 ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
									</a>
								</div>
							</div>
						</article>
					<?php endforeach; ?>
				</div>
			</div>
		</section>
	<?php endif; ?>

	<?php accupro_cta_band(); ?>
</main>

<?php
get_footer();
