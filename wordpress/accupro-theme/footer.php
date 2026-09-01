<?php
/**
 * Footer.
 *
 * @package Accupro
 */

defined( 'ABSPATH' ) || exit;

$accupro_socials  = function_exists( 'accupro_social_links' ) ? accupro_social_links() : array();
$accupro_icon_map = array(
	'instagram' => 'ig',
	'facebook'  => 'fb',
	'linkedin'  => 'li',
	'tiktok'    => 'tt',
);
$accupro_phone    = accupro_opt( 'phone_1' );
$accupro_email    = accupro_opt( 'email_1' );
$accupro_wa       = function_exists( 'accupro_whatsapp_url' ) ? accupro_whatsapp_url() : '';
?>
<footer class="footer">
	<div class="container">
		<div class="footer__grid">
			<div>
				<a class="brand" href="<?php echo esc_url( home_url( '/' ) ); ?>" style="margin-bottom:14px">
					<?php echo accupro_logo( 'brand__logo brand__logo--light' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
					<?php if ( ! accupro_opt( 'logo_image', 0 ) && ! get_theme_mod( 'custom_logo' ) ) : ?>
						<span class="brand__name" style="color:#fff">ACCUPRO</span>
					<?php endif; ?>
				</a>
				<?php if ( accupro_opt( 'tagline' ) ) : ?>
					<p><?php echo esc_html( accupro_opt( 'tagline' ) ); ?></p>
				<?php endif; ?>
				<?php if ( $accupro_socials ) : ?>
					<div class="footer__socials">
						<?php foreach ( $accupro_socials as $accupro_key => $accupro_social ) : ?>
							<a href="<?php echo esc_url( $accupro_social['url'] ); ?>" target="_blank" rel="noopener" aria-label="<?php echo esc_attr( $accupro_social['label'] ); ?>">
								<?php echo accupro_icon( isset( $accupro_icon_map[ $accupro_key ] ) ? $accupro_icon_map[ $accupro_key ] : 'globe', 19 ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
							</a>
						<?php endforeach; ?>
					</div>
				<?php endif; ?>
			</div>

			<div>
				<h4><?php esc_html_e( 'Layanan', 'accupro' ); ?></h4>
				<ul>
					<?php foreach ( accupro_categories() as $accupro_cat ) : ?>
						<li><a href="<?php echo esc_url( get_term_link( $accupro_cat ) ); ?>"><?php echo esc_html( $accupro_cat->name ); ?></a></li>
					<?php endforeach; ?>
				</ul>
			</div>

			<div>
				<h4><?php esc_html_e( 'Perusahaan', 'accupro' ); ?></h4>
				<?php
				if ( has_nav_menu( 'footer_kolom' ) ) {
					wp_nav_menu(
						array(
							'theme_location' => 'footer_kolom',
							'container'      => false,
							'depth'          => 1,
							'items_wrap'     => '<ul>%3$s</ul>',
							'fallback_cb'    => false,
						)
					);
				} else {
					$accupro_tools = get_post_type_archive_link( 'alat' );
					?>
					<ul>
						<?php if ( $accupro_tools ) : ?>
							<li><a href="<?php echo esc_url( $accupro_tools ); ?>"><?php esc_html_e( 'Alat Hitung', 'accupro' ); ?></a></li>
						<?php endif; ?>
						<li><a href="<?php echo esc_url( accupro_contact_url() ); ?>"><?php esc_html_e( 'Kontak', 'accupro' ); ?></a></li>
					</ul>
					<?php
				}
				?>
			</div>

			<div>
				<h4><?php esc_html_e( 'Hubungi kami', 'accupro' ); ?></h4>
				<ul>
					<?php foreach ( array( accupro_opt( 'address_1' ), accupro_opt( 'address_2' ), accupro_opt( 'city' ) ) as $accupro_line ) : ?>
						<?php if ( $accupro_line ) : ?>
							<li><?php echo esc_html( $accupro_line ); ?></li>
						<?php endif; ?>
					<?php endforeach; ?>

					<?php if ( $accupro_phone ) : ?>
						<li><a href="tel:<?php echo esc_attr( accupro_tel( $accupro_phone ) ); ?>"><?php echo esc_html( $accupro_phone ); ?></a></li>
					<?php endif; ?>

					<?php if ( $accupro_wa ) : ?>
						<li><a href="<?php echo esc_url( $accupro_wa ); ?>" target="_blank" rel="noopener">WhatsApp <?php echo esc_html( accupro_opt( 'whatsapp' ) ); ?></a></li>
					<?php endif; ?>

					<?php if ( $accupro_email ) : ?>
						<li><a href="mailto:<?php echo esc_attr( $accupro_email ); ?>"><?php echo esc_html( $accupro_email ); ?></a></li>
					<?php endif; ?>

					<?php if ( accupro_opt( 'hours' ) ) : ?>
						<li><?php echo esc_html( accupro_opt( 'hours' ) ); ?></li>
					<?php endif; ?>
				</ul>
			</div>
		</div>

		<div class="footer__base">
			<p>© <span data-year><?php echo esc_html( gmdate( 'Y' ) ); ?></span> <?php echo esc_html( accupro_opt( 'legal_name', get_bloginfo( 'name' ) ) ); ?>. <?php esc_html_e( 'Seluruh hak cipta dilindungi.', 'accupro' ); ?></p>
		</div>
	</div>
</footer>

<?php accupro_wa_float(); ?>
<?php wp_footer(); ?>
</body>
</html>
