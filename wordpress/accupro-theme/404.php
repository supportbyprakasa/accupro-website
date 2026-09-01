<?php
/**
 * Halaman tidak ditemukan.
 *
 * Alih-alih jalan buntu, halaman ini menawarkan jalan keluar: pencarian,
 * katalog layanan, dan tombol WhatsApp.
 *
 * @package Accupro
 */

defined( 'ABSPATH' ) || exit;

get_header();
?>

<main id="main">
	<section class="section">
		<div class="container">
			<span class="eyebrow">404</span>
			<h1 style="margin:8px 0 12px"><?php esc_html_e( 'Halaman ini tidak ditemukan', 'accupro' ); ?></h1>
			<p class="lede" style="max-width:60ch"><?php esc_html_e( 'Tautannya mungkin sudah berubah atau salah ketik. Coba cari di bawah, atau lihat katalog layanan kami.', 'accupro' ); ?></p>

			<form class="card card--pad" role="search" method="get" action="<?php echo esc_url( home_url( '/' ) ); ?>" style="margin-top:clamp(20px,3vw,32px);max-width:620px">
				<label class="field">
					<span class="field__label"><?php esc_html_e( 'Cari di situs ini', 'accupro' ); ?></span>
					<input class="field__input" type="search" name="s" value="<?php echo esc_attr( get_search_query() ); ?>" placeholder="<?php esc_attr_e( 'Kata kunci…', 'accupro' ); ?>">
				</label>
				<div class="cluster" style="margin-top:14px">
					<button class="btn btn--primary" type="submit"><?php esc_html_e( 'Cari', 'accupro' ); ?></button>
					<?php if ( get_post_type_archive_link( 'layanan' ) ) : ?>
						<a class="btn btn--quiet" href="<?php echo esc_url( get_post_type_archive_link( 'layanan' ) ); ?>"><?php esc_html_e( 'Lihat semua layanan', 'accupro' ); ?></a>
					<?php endif; ?>
				</div>
			</form>
		</div>
	</section>

	<?php accupro_cta_band(); ?>
</main>

<?php
get_footer();
