<?php
/**
 * Satu alat hitung.
 *
 * Yang berbeda antar alat hanya bagian input — panel hasil, riwayat, dan
 * kotak ajakan sama semua, dan seluruh perhitungan dikerjakan
 * assets/js/calculators.js di browser pengunjung. Tidak ada angka yang
 * dikirim ke server.
 *
 * @package Accupro
 */

defined( 'ABSPATH' ) || exit;

get_header();

while ( have_posts() ) :
	the_post();

	$accupro_slug   = get_post_meta( get_the_ID(), 'accupro_tool_slug', true );
	$accupro_kind   = get_post_meta( get_the_ID(), 'accupro_tool_kind', true );
	$accupro_label  = get_post_meta( get_the_ID(), 'accupro_result_label', true );
	$accupro_bridge = (int) get_post_meta( get_the_ID(), 'accupro_bridge_post', true );
	$accupro_form   = $accupro_slug ? accupro_tool_form( $accupro_slug ) : '';
	$accupro_own    = 'own' === $accupro_kind;
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
						'label' => __( 'Alat Hitung', 'accupro' ),
						'url'   => get_post_type_archive_link( 'alat' ),
					),
					array( 'label' => get_the_title() ),
				),
				'kicker'  => '<span class="tag">' . ( $accupro_own ? esc_html__( 'Simulator Accupro', 'accupro' ) : esc_html__( 'Kalkulator pajak', 'accupro' ) ) . '</span>',
				'heading' => get_the_title(),
				'lede'    => get_the_excerpt(),
				'media'   => accupro_media( get_the_ID(), '4 / 3' ),
			)
		);
		?>

		<?php if ( ! $accupro_form ) : ?>
			<section class="section">
				<div class="container">
					<div class="card card--pad">
						<h2><?php esc_html_e( 'Alat ini belum dikonfigurasi', 'accupro' ); ?></h2>
						<p class="small" style="margin-top:8px"><?php esc_html_e( 'Pilih kode kalkulator pada kotak "Detail Accupro" di layar edit alat ini agar formulirnya muncul.', 'accupro' ); ?></p>
					</div>
				</div>
			</section>
		<?php else : ?>
			<section class="section">
				<div class="container">
					<div class="grid g2" style="align-items:start">
						<form class="card card--pad" id="tool-form" data-tool="<?php echo esc_attr( $accupro_slug ); ?>" novalidate>
							<div class="cluster" style="gap:9px;margin-bottom:14px">
								<span style="color:var(--navy)"><?php echo accupro_icon( 'calc', 20 ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></span>
								<span class="eyebrow"><?php esc_html_e( 'Input', 'accupro' ); ?></span>
							</div>
							<?php echo $accupro_form; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
							<div class="cluster" style="margin-top:18px">
								<button class="btn btn--primary" type="submit" style="flex:1 1 auto"><?php esc_html_e( 'Hitung', 'accupro' ); ?></button>
								<button class="btn btn--quiet" type="reset"><?php esc_html_e( 'Atur ulang', 'accupro' ); ?></button>
							</div>
						</form>

						<div class="stack" style="--s:16px">
							<div class="card card--navy card--pad">
								<div class="cluster" style="gap:9px;margin-bottom:12px">
									<span style="color:var(--navy)"><?php echo accupro_icon( 'chart', 20 ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></span>
									<span class="eyebrow"><?php esc_html_e( 'Hasil', 'accupro' ); ?></span>
								</div>
								<p class="eyebrow" style="color:var(--faint)"><?php echo esc_html( $accupro_label ? $accupro_label : __( 'Hasil hitung', 'accupro' ) ); ?></p>
								<p class="stat__v" id="result-headline" style="font-size:2.2rem;margin:4px 0 14px;word-break:break-word">—</p>
								<table class="dtable" id="result-table"><tbody></tbody></table>
								<p class="tiny" id="result-note" style="margin-top:10px"></p>
								<div class="cluster" style="margin-top:14px">
									<button class="btn btn--quiet" type="button" id="btn-copy"><?php esc_html_e( 'Salin hasil', 'accupro' ); ?></button>
								</div>
							</div>

							<div class="card card--surface card--pad">
								<div class="cluster" style="gap:9px;margin-bottom:8px">
									<span style="color:var(--navy)"><?php echo accupro_icon( 'clock', 19 ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></span>
									<span class="eyebrow"><?php esc_html_e( 'Riwayat perhitungan', 'accupro' ); ?></span>
								</div>
								<ul class="stack" style="--s:8px" id="calc-history"></ul>
								<button class="btn btn--quiet btn--sm" type="button" id="btn-clear-history" style="margin-top:12px"><?php esc_html_e( 'Hapus riwayat', 'accupro' ); ?></button>
							</div>

							<?php if ( $accupro_bridge && 'publish' === get_post_status( $accupro_bridge ) ) : ?>
								<div class="card card--gold card--pad">
									<div class="cluster" style="gap:9px;margin-bottom:8px">
										<span style="color:var(--gold-700)"><?php echo accupro_icon( 'arrow', 19 ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></span>
										<span class="eyebrow eyebrow--gold"><?php esc_html_e( 'Lanjut ke layanan', 'accupro' ); ?></span>
									</div>
									<h4><?php esc_html_e( 'Perlu kami yang mengurus?', 'accupro' ); ?></h4>
									<p class="small" style="margin-top:6px"><?php esc_html_e( 'Kami bisa memverifikasi angka ini sekaligus mengurus pelaporan atau pengajuannya.', 'accupro' ); ?></p>
									<a class="btn btn--gold btn--sm" style="margin-top:12px" href="<?php echo esc_url( get_permalink( $accupro_bridge ) ); ?>">
										<?php echo esc_html( get_the_title( $accupro_bridge ) ); ?> <?php echo accupro_icon( 'arrow', 15 ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
									</a>
								</div>
							<?php endif; ?>
						</div>
					</div>
				</div>
			</section>

			<section class="section section--surface">
				<div class="container">
					<div class="card card--pad cluster" style="gap:22px;flex-wrap:wrap">
						<span class="icon-lead" style="margin:0"><?php echo accupro_icon( 'scale', 30 ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></span>
						<div>
							<h3><?php esc_html_e( 'Hasil ini estimasi', 'accupro' ); ?></h3>
							<p class="small" style="margin-top:6px"><?php esc_html_e( 'Angkanya indikatif dan bukan pengganti perhitungan resmi. Minta kami memverifikasi sebelum Anda melaporkan atau menjadikannya dasar anggaran.', 'accupro' ); ?></p>
						</div>
						<a class="btn btn--primary" href="<?php echo esc_url( accupro_contact_url() ); ?>">
							<?php esc_html_e( 'Minta diverifikasi', 'accupro' ); ?> <?php echo accupro_icon( 'arrow', 17 ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
						</a>
					</div>
				</div>
			</section>
		<?php endif; ?>

		<?php accupro_cta_band(); ?>
	</main>

	<?php
endwhile;

get_footer();
