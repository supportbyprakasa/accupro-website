<?php
/**
 * Kepala dokumen, bar utilitas, dan header.
 *
 * @package Accupro
 */

defined( 'ABSPATH' ) || exit;
?>
<!doctype html>
<html <?php language_attributes(); ?>>
<head>
<meta charset="<?php bloginfo( 'charset' ); ?>">
<meta name="viewport" content="width=device-width, initial-scale=1">
<?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
<a class="skip" href="#main"><?php esc_html_e( 'Lewati ke konten', 'accupro' ); ?></a>

<?php accupro_utility_bar(); ?>

<header class="header">
	<div class="container header__bar">
		<a class="brand" href="<?php echo esc_url( home_url( '/' ) ); ?>" aria-label="<?php echo esc_attr( sprintf( /* translators: %s: nama perusahaan. */ __( '%s — beranda', 'accupro' ), accupro_opt( 'legal_name', get_bloginfo( 'name' ) ) ) ); ?>">
			<?php echo accupro_logo_mark(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
			<span class="brand__name">ACCUPRO<span class="brand__sub"><?php esc_html_e( 'Pajak · Legalitas · Bisnis', 'accupro' ); ?></span></span>
		</a>

		<nav class="nav" id="primary-nav" aria-label="<?php esc_attr_e( 'Navigasi utama', 'accupro' ); ?>">
			<?php accupro_primary_nav(); ?>
			<?php accupro_language_switcher(); ?>
		</nav>

		<div class="header__end">
			<?php accupro_language_switcher(); ?>
			<a class="btn btn--primary btn--sm" href="<?php echo esc_url( accupro_contact_url() ); ?>"><?php esc_html_e( 'Konsultasi gratis', 'accupro' ); ?></a>
			<button class="burger" aria-expanded="false" aria-controls="primary-nav"
				aria-label="<?php esc_attr_e( 'Menu', 'accupro' ); ?>"
				data-menu-label="<?php esc_attr_e( 'Menu', 'accupro' ); ?>"
				data-close-label="<?php esc_attr_e( 'Tutup', 'accupro' ); ?>"><?php echo accupro_icon( 'menu', 22 ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></button>
		</div>
	</div>
</header>
