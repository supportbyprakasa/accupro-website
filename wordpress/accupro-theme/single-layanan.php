<?php
/**
 * Satu halaman layanan.
 *
 * @package Accupro
 */

defined( 'ABSPATH' ) || exit;

get_header();

while ( have_posts() ) :
	the_post();

	$accupro_terms = get_the_terms( get_the_ID(), 'kategori_layanan' );
	$accupro_term  = ( $accupro_terms && ! is_wp_error( $accupro_terms ) ) ? $accupro_terms[0] : null;
	$accupro_icon  = $accupro_term ? get_term_meta( $accupro_term->term_id, 'accupro_icon', true ) : '';
	$accupro_crumb = array(
		array(
			'label' => __( 'Beranda', 'accupro' ),
			'url'   => home_url( '/' ),
		),
		array(
			'label' => __( 'Layanan', 'accupro' ),
			'url'   => get_post_type_archive_link( 'layanan' ),
		),
	);

	if ( $accupro_term ) {
		$accupro_crumb[] = array(
			'label' => $accupro_term->name,
			'url'   => get_term_link( $accupro_term ),
		);
	}

	$accupro_crumb[] = array( 'label' => get_the_title() );
	?>

	<main id="main">
		<?php
		accupro_page_banner(
			array(
				'crumbs'  => $accupro_crumb,
				'kicker'  => $accupro_term ? '<span class="tag">' . esc_html( $accupro_term->name ) . '</span>' : '',
				'heading' => get_the_title(),
				'lede'    => accupro_summary( get_post() ),
				'extra'   => '<div class="cluster" style="margin-top:18px"><a class="btn btn--primary" href="' . esc_url( accupro_contact_url() ) . '">' . esc_html__( 'Tanya layanan ini', 'accupro' ) . '</a></div>',
				'image'   => accupro_banner_id( get_the_ID() ),
				'image_label' => get_the_title(),
			)
		);
		?>

		<section class="section">
			<div class="container split split--narrow">
				<div class="prose">
					<?php
					if ( trim( get_the_content() ) ) {
						the_content();
					} else {
						echo '<p class="lede">' . esc_html__( 'Rincian layanan ini sedang kami lengkapi. Hubungi kami untuk penjelasan dokumen, biaya, dan lama proses sesuai kasus Anda.', 'accupro' ) . '</p>';
					}
					?>

					<?php if ( get_post_meta( get_the_ID(), 'accupro_shot', true ) ) : ?>
						<!-- Briefing foto disimpan sebagai catatan internal, tidak ditampilkan. -->
					<?php endif; ?>
				</div>

				<aside class="stack" style="--s:16px">
					<div class="card card--navy card--pad">
						<span class="icon-lead"><?php echo accupro_icon( 'spark', 24 ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></span>
						<h3 style="margin-top:10px"><?php esc_html_e( 'Butuh bantuan untuk layanan ini?', 'accupro' ); ?></h3>
						<p class="small" style="margin-top:8px;color:#C3C7E6"><?php esc_html_e( 'Ceritakan kondisi Anda, kami jelaskan dokumen yang dibutuhkan dan perkiraan waktunya.', 'accupro' ); ?></p>
						<?php $accupro_wa = function_exists( 'accupro_whatsapp_url' ) ? accupro_whatsapp_url() : ''; ?>
						<?php if ( $accupro_wa ) : ?>
							<a class="btn btn--gold btn--sm btn--block" style="margin-top:14px" href="<?php echo esc_url( $accupro_wa ); ?>" target="_blank" rel="noopener">
								<?php echo accupro_icon( 'whatsapp', 16 ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?> <?php esc_html_e( 'Chat WhatsApp', 'accupro' ); ?>
							</a>
						<?php endif; ?>
					</div>

					<?php if ( $accupro_term ) : ?>
						<?php
						$accupro_siblings = array_filter(
							accupro_get_services( $accupro_term->slug ),
							static function ( $item ) {
								return $item->ID !== get_the_ID();
							}
						);
						$accupro_siblings = array_slice( $accupro_siblings, 0, 5 );
						?>
						<?php if ( $accupro_siblings ) : ?>
							<div class="card card--surface card--pad">
								<div class="cluster" style="gap:9px;margin-bottom:10px">
									<span style="color:var(--navy)"><?php echo accupro_icon( $accupro_icon ? $accupro_icon : 'chart', 19 ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></span>
									<span class="eyebrow"><?php esc_html_e( 'Layanan lain di bidang ini', 'accupro' ); ?></span>
								</div>
								<ul class="stack" style="--s:8px">
									<?php foreach ( $accupro_siblings as $accupro_sibling ) : ?>
										<li><a href="<?php echo esc_url( get_permalink( $accupro_sibling ) ); ?>"><?php echo esc_html( get_the_title( $accupro_sibling ) ); ?></a></li>
									<?php endforeach; ?>
								</ul>
								<a class="btn btn--quiet btn--sm" style="margin-top:12px" href="<?php echo esc_url( get_term_link( $accupro_term ) ); ?>">
									<?php esc_html_e( 'Lihat semua', 'accupro' ); ?> <?php echo accupro_icon( 'arrow', 15 ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
								</a>
							</div>
						<?php endif; ?>
					<?php endif; ?>
				</aside>
			</div>
		</section>

		<?php accupro_cta_band(); ?>
	</main>

	<?php
endwhile;

get_footer();
