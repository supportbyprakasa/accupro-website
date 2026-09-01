<?php
/**
 * Beranda.
 *
 * Semua bagian di halaman ini diisi dari Accupro > Section Beranda dan dari
 * post type Layanan / Testimoni, jadi urutan dan isinya bisa diubah dari
 * dasbor tanpa menyentuh file ini.
 *
 * @package Accupro
 */

defined( 'ABSPATH' ) || exit;

get_header();

$accupro_slides  = array_values(
	array_filter(
		accupro_rows( 'hero_slides' ),
		static function ( $slide ) {
			return ! empty( $slide['headline'] );
		}
	)
);
$accupro_pillars = array_values(
	array_filter(
		accupro_rows( 'pillars' ),
		static function ( $pillar ) {
			return ! empty( $pillar['title'] );
		}
	)
);
$accupro_stats   = array_filter(
	accupro_rows( 'stats' ),
	static function ( $stat ) {
		return ! empty( $stat['value'] ) && ! empty( $stat['in_hero'] );
	}
);
$accupro_wa      = function_exists( 'accupro_whatsapp_url' ) ? accupro_whatsapp_url() : '';
?>

<main id="main">

	<?php if ( $accupro_slides ) : ?>
		<section class="hero" aria-label="<?php esc_attr_e( 'Sorotan beranda', 'accupro' ); ?>">
			<div class="container hero__grid">
				<div class="hero__content">
					<div class="cluster">
						<span class="pill"><?php echo accupro_icon( 'badge', 14 ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?> <?php esc_html_e( 'Konsultan bersertifikat (CTL)', 'accupro' ); ?></span>
						<span class="pill"><?php echo accupro_icon( 'globe', 14 ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?> <?php esc_html_e( 'Melayani PMA & ekspatriat', 'accupro' ); ?></span>
					</div>
					<div class="hero__slides">
						<?php foreach ( $accupro_slides as $accupro_i => $accupro_slide ) : ?>
							<div class="hero__slide <?php echo 0 === $accupro_i ? 'is-active' : ''; ?>"
								aria-label="<?php echo esc_attr( sprintf( /* translators: %d: nomor slide. */ __( 'Slide %d', 'accupro' ), $accupro_i + 1 ) ); ?>"
								aria-hidden="<?php echo 0 === $accupro_i ? 'false' : 'true'; ?>">
								<h1><?php echo esc_html( $accupro_slide['headline'] ); ?></h1>
								<?php if ( ! empty( $accupro_slide['subtext'] ) ) : ?>
									<p class="lede"><?php echo esc_html( $accupro_slide['subtext'] ); ?></p>
								<?php endif; ?>
							</div>
						<?php endforeach; ?>
					</div>

					<div class="cluster" style="margin-top:22px">
						<a class="btn btn--primary" href="<?php echo esc_url( accupro_contact_url() ); ?>">
							<?php esc_html_e( 'Konsultasi gratis', 'accupro' ); ?> <?php echo accupro_icon( 'arrow', 17 ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
						</a>
						<?php if ( $accupro_wa ) : ?>
							<a class="btn btn--gold" href="<?php echo esc_url( $accupro_wa ); ?>" target="_blank" rel="noopener">
								<?php echo accupro_icon( 'whatsapp', 18 ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?> WhatsApp
							</a>
						<?php endif; ?>
					</div>

					<?php if ( $accupro_stats ) : ?>
						<ul class="grid g4 g-stats hero__stats">
							<?php foreach ( $accupro_stats as $accupro_stat ) : ?>
								<li>
									<span class="stat__v"><?php echo esc_html( $accupro_stat['value'] ); ?></span>
									<span class="tiny" style="display:block;margin-top:6px"><?php echo esc_html( isset( $accupro_stat['label'] ) ? $accupro_stat['label'] : '' ); ?></span>
								</li>
							<?php endforeach; ?>
						</ul>
					<?php endif; ?>

					<?php if ( count( $accupro_slides ) > 1 ) : ?>
						<div class="hero__nav" aria-label="<?php esc_attr_e( 'Pilih slide', 'accupro' ); ?>">
							<button class="hero__arrow" type="button" data-slide="prev" aria-label="<?php esc_attr_e( 'Slide sebelumnya', 'accupro' ); ?>"><?php echo accupro_icon( 'chevron', 16 ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></button>
							<?php foreach ( $accupro_slides as $accupro_i => $accupro_slide ) : ?>
								<button class="hero__dot <?php echo 0 === $accupro_i ? 'is-active' : ''; ?>" type="button"
									data-slide-index="<?php echo (int) $accupro_i; ?>"
									aria-label="<?php echo esc_attr( sprintf( /* translators: %d: nomor slide. */ __( 'Ke slide %d', 'accupro' ), $accupro_i + 1 ) ); ?>"
									<?php echo 0 === $accupro_i ? 'aria-current="true"' : ''; ?>></button>
							<?php endforeach; ?>
							<button class="hero__arrow hero__arrow--next" type="button" data-slide="next" aria-label="<?php esc_attr_e( 'Slide berikutnya', 'accupro' ); ?>"><?php echo accupro_icon( 'chevron', 16 ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></button>
						</div>
					<?php endif; ?>
				</div>

				<div class="hero__media">
					<div class="hero__frame">
						<?php foreach ( $accupro_slides as $accupro_i => $accupro_slide ) : ?>
							<div class="hero__frame-slide <?php echo 0 === $accupro_i ? 'is-active' : ''; ?>" aria-hidden="<?php echo 0 === $accupro_i ? 'false' : 'true'; ?>">
								<?php
								echo accupro_attachment_media( // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
									isset( $accupro_slide['image'] ) ? $accupro_slide['image'] : 0,
									'1 / 1',
									array(
										'size'  => 'full',
										'eager' => 0 === $accupro_i,
										'label' => $accupro_slide['headline'],
									)
								);
								?>
							</div>
						<?php endforeach; ?>
					</div>
				</div>
			</div>
		</section>
	<?php endif; ?>

	<?php accupro_service_finder(); ?>

	<?php if ( $accupro_pillars ) : ?>
		<section class="section section--surface">
			<div class="container">
				<div class="between" style="margin-bottom:clamp(24px,3vw,40px)">
					<div>
						<span class="eyebrow"><?php esc_html_e( 'Yang kami kerjakan', 'accupro' ); ?></span>
						<h2 style="margin-top:8px"><?php esc_html_e( 'Layanan pajak, legalitas, dan bisnis dalam satu tempat', 'accupro' ); ?></h2>
					</div>
					<?php if ( get_post_type_archive_link( 'layanan' ) ) : ?>
						<a class="btn btn--ghost btn--sm" href="<?php echo esc_url( get_post_type_archive_link( 'layanan' ) ); ?>">
							<?php esc_html_e( 'Semua layanan', 'accupro' ); ?> <?php echo accupro_icon( 'arrow', 16 ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
						</a>
					<?php endif; ?>
				</div>
				<div class="grid g3">
					<?php foreach ( $accupro_pillars as $accupro_pillar ) : ?>
						<article class="card card--link">
							<?php
							echo accupro_attachment_media( // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
								isset( $accupro_pillar['image'] ) ? $accupro_pillar['image'] : 0,
								'4 / 3',
								array(
									'size'  => 'accupro-card',
									'class' => 'card__media',
									'label' => $accupro_pillar['title'],
								)
							);
							?>
							<div class="card__body card__body--badged">
								<span class="card__badge"><?php echo accupro_icon( ! empty( $accupro_pillar['icon'] ) ? $accupro_pillar['icon'] : 'chart', 21 ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></span>
								<h3><?php echo esc_html( $accupro_pillar['title'] ); ?></h3>
								<?php if ( ! empty( $accupro_pillar['text'] ) ) : ?>
									<p class="small" style="margin-top:8px"><?php echo esc_html( $accupro_pillar['text'] ); ?></p>
								<?php endif; ?>
							</div>
						</article>
					<?php endforeach; ?>
				</div>
			</div>
		</section>
	<?php endif; ?>

	<?php if ( accupro_categories() ) : ?>
		<section class="section">
			<div class="container">
				<span class="eyebrow"><?php esc_html_e( 'Telusuri sesuai kebutuhan', 'accupro' ); ?></span>
				<h2 style="margin:8px 0 12px"><?php esc_html_e( 'Pilih bidang layanan', 'accupro' ); ?></h2>
				<div style="margin-top:clamp(24px,3vw,40px)">
					<?php echo do_shortcode( '[accupro_kategori_layanan]' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
				</div>
			</div>
		</section>
	<?php endif; ?>

	<?php
	$accupro_testimoni = do_shortcode( '[accupro_testimoni jumlah="4"]' );
	if ( trim( $accupro_testimoni ) ) :
		?>
		<section class="section section--surface">
			<div class="container">
				<span class="eyebrow"><?php esc_html_e( 'Testimoni', 'accupro' ); ?></span>
				<h2 style="margin:8px 0 clamp(24px,3vw,36px)"><?php esc_html_e( 'Kata klien kami', 'accupro' ); ?></h2>
				<?php echo $accupro_testimoni; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
			</div>
		</section>
	<?php endif; ?>

	<?php accupro_cta_band(); ?>
</main>

<?php
get_footer();
