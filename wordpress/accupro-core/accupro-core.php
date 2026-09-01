<?php
/**
 * Plugin Name:       Accupro Core
 * Plugin URI:        https://github.com/supportbyprakasa/accupro-website
 * Description:       Struktur konten Accupro — custom post type Layanan, Testimoni, Tim, dan Alat Hitung, plus semua pengaturan section yang dipakai tema Accupro. Sengaja dipisah dari tema supaya konten tetap aman kalau tema diganti.
 * Version:           1.0.0
 * Requires at least: 6.0
 * Requires PHP:      7.4
 * Author:            Prakasa Group
 * Text Domain:       accupro
 * Domain Path:       /languages
 *
 * Semua label & teks yang tampil di depan sengaja dibungkus fungsi terjemahan
 * WordPress supaya TranslatePress (yang sudah dipakai di situs ini untuk
 * id / en / ch) bisa menangkap dan menerjemahkannya. Jangan menaruh teks
 * mentah tanpa __() di output depan.
 *
 * @package Accupro
 */

defined( 'ABSPATH' ) || exit;

define( 'ACCUPRO_CORE_VERSION', '1.0.0' );
define( 'ACCUPRO_CORE_FILE', __FILE__ );
define( 'ACCUPRO_CORE_PATH', plugin_dir_path( __FILE__ ) );
define( 'ACCUPRO_CORE_URL', plugin_dir_url( __FILE__ ) );

require_once ACCUPRO_CORE_PATH . 'inc/helpers.php';
require_once ACCUPRO_CORE_PATH . 'inc/post-types.php';
require_once ACCUPRO_CORE_PATH . 'inc/taxonomies.php';
require_once ACCUPRO_CORE_PATH . 'inc/metaboxes.php';
require_once ACCUPRO_CORE_PATH . 'inc/settings.php';
require_once ACCUPRO_CORE_PATH . 'inc/admin-media.php';
require_once ACCUPRO_CORE_PATH . 'inc/setup-notice.php';
require_once ACCUPRO_CORE_PATH . 'inc/seed.php';
require_once ACCUPRO_CORE_PATH . 'inc/shortcodes.php';

/**
 * Aktivasi: daftarkan struktur lalu flush rewrite sekali, supaya permalink
 * /layanan/<slug>/ langsung hidup tanpa perlu buka Settings > Permalinks.
 */
function accupro_core_activate() {
	accupro_register_post_types();
	accupro_register_taxonomies();
	accupro_seed_default_content();
	flush_rewrite_rules();
}
register_activation_hook( ACCUPRO_CORE_FILE, 'accupro_core_activate' );

/**
 * Nonaktif: bersihkan rewrite rules supaya tidak menyisakan aturan mati.
 */
function accupro_core_deactivate() {
	flush_rewrite_rules();
}
register_deactivation_hook( ACCUPRO_CORE_FILE, 'accupro_core_deactivate' );

/**
 * Muat terjemahan plugin.
 */
function accupro_core_load_textdomain() {
	load_plugin_textdomain( 'accupro', false, dirname( plugin_basename( ACCUPRO_CORE_FILE ) ) . '/languages' );
}
add_action( 'init', 'accupro_core_load_textdomain' );
