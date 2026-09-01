<?php
/**
 * Satu artikel.
 *
 * @package Accupro
 */

defined( 'ABSPATH' ) || exit;

get_header();

while ( have_posts() ) :
	the_post();
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
						'label' => __( 'Artikel', 'accupro' ),
						'url'   => get_permalink( get_option( 'page_for_posts' ) ) ? get_permalink( get_option( 'page_for_posts' ) ) : home_url( '/' ),
					),
					array( 'label' => get_the_title() ),
				),
				'kicker'  => '<span class="tiny">' . esc_html( get_the_date() ) . '</span>',
				'heading' => get_the_title(),
				// Hanya ringkasan yang ditulis sendiri; ringkasan otomatis cuma
				// mengulang kalimat pertama isi halaman tepat di atasnya.
				'lede'    => get_post()->post_excerpt,
				'media'   => accupro_media( get_the_ID(), '4 / 3' ),
			)
		);
		?>

		<section class="section">
			<div class="container split split--narrow">
				<article class="prose"><?php the_content(); ?></article>
				<aside class="stack" style="--s:16px">
					<?php echo do_shortcode( '[accupro_cta]' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
				</aside>
			</div>
		</section>
	</main>

	<?php
endwhile;

get_footer();
