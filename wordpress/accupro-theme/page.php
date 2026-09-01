<?php
/**
 * Halaman statis biasa (Tentang Kami, Kontak, Kebijakan Privasi, dan lain-lain).
 *
 * Isinya ditulis penuh dari editor WordPress, jadi editor bisa menyisipkan
 * section apa pun lewat shortcode Accupro — [accupro_layanan],
 * [accupro_kontak], [accupro_tim], [accupro_testimoni], [accupro_cta].
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
					array( 'label' => get_the_title() ),
				),
				'heading' => get_the_title(),
				// Hanya ringkasan yang ditulis sendiri; ringkasan otomatis cuma
				// mengulang kalimat pertama isi halaman tepat di atasnya.
				'lede'    => get_post()->post_excerpt,
				'media'   => accupro_media( get_the_ID(), '4 / 3' ),
			)
		);
		?>

		<section class="section">
			<div class="container">
				<div class="prose"><?php the_content(); ?></div>
				<?php
				wp_link_pages(
					array(
						'before' => '<div class="pagination">',
						'after'  => '</div>',
					)
				);
				?>
			</div>
		</section>

		<?php accupro_cta_band(); ?>
	</main>

	<?php
endwhile;

get_footer();
