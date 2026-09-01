<?php
/**
 * Cadangan untuk semua tampilan daftar: arsip, blog, hasil pencarian.
 *
 * WordPress mewajibkan file ini ada. Template yang lebih spesifik
 * (archive-layanan.php, taxonomy-kategori_layanan.php, archive-alat.php)
 * menggantikannya bila cocok.
 *
 * @package Accupro
 */

defined( 'ABSPATH' ) || exit;

get_header();

if ( is_search() ) {
	$accupro_heading = sprintf(
		/* translators: %s: kata kunci pencarian. */
		__( 'Hasil pencarian: %s', 'accupro' ),
		get_search_query()
	);
} elseif ( is_archive() ) {
	$accupro_heading = wp_strip_all_tags( get_the_archive_title() );
} else {
	$accupro_heading = __( 'Artikel', 'accupro' );
}
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
				array( 'label' => $accupro_heading ),
			),
			'heading' => $accupro_heading,
			'lede'    => wp_strip_all_tags( get_the_archive_description() ),
			'media'   => accupro_default_banner( $accupro_heading ),
		)
	);
	?>

	<section class="section">
		<div class="container">
			<?php if ( have_posts() ) : ?>
				<div class="grid g3">
					<?php
					while ( have_posts() ) :
						the_post();
						?>
						<a class="card card--link" href="<?php the_permalink(); ?>">
							<?php echo accupro_media( get_the_ID(), '16 / 9', 'card__media' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
							<div class="card__body">
								<span class="tiny"><?php echo esc_html( get_the_date() ); ?></span>
								<h3 style="margin-top:6px"><?php the_title(); ?></h3>
								<p class="small" style="margin-top:8px"><?php echo esc_html( get_the_excerpt() ); ?></p>
							</div>
						</a>
						<?php
					endwhile;
					?>
				</div>

				<?php $accupro_pages = paginate_links( array( 'type' => 'plain' ) ); ?>
				<?php if ( $accupro_pages ) : ?>
					<div class="pagination"><?php echo wp_kses_post( $accupro_pages ); ?></div>
				<?php endif; ?>
			<?php else : ?>
				<p class="lede"><?php esc_html_e( 'Belum ada yang bisa ditampilkan di sini.', 'accupro' ); ?></p>
			<?php endif; ?>
		</div>
	</section>

	<?php accupro_cta_band(); ?>
</main>

<?php
get_footer();
