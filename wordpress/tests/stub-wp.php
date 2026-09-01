<?php
/**
 * WordPress tiruan seperlunya, untuk uji asap tema dan plugin Accupro.
 *
 * Ini BUKAN WordPress. Fungsinya cuma satu: menjalankan setiap template dari
 * baris perintah supaya kesalahan PHP — fungsi salah nama, argumen kurang,
 * variabel kosong yang dipakai sebagai array — ketahuan sebelum file-nya
 * diunggah, bukan setelah muncul layar putih di situs asli.
 *
 * Yang TIDAK diuji di sini: query database, rewrite rule, hook priority,
 * sanitasi bawaan WordPress, dan tampilan CSS. Semua itu tetap harus dicoba di
 * WordPress sungguhan.
 *
 * @package Accupro
 */

// phpcs:disable

define( 'ABSPATH', __DIR__ . '/' );
define( 'OBJECT', 'OBJECT' );
define( 'DOING_AUTOSAVE', false );

/* ---------------------------------------------------------------- data uji */

$GLOBALS['stub_options']   = array();
$GLOBALS['stub_posts']     = array();
$GLOBALS['stub_terms']     = array();
$GLOBALS['stub_meta']      = array();
$GLOBALS['stub_term_meta'] = array();
$GLOBALS['stub_actions']   = array();
$GLOBALS['stub_filters']   = array();
$GLOBALS['stub_shortcodes']= array();
$GLOBALS['stub_queue']     = array();
$GLOBALS['stub_post']      = null;
$GLOBALS['stub_queried']   = null;
$GLOBALS['stub_context']   = 'front';

class WP_Post {
	public $ID = 0;
	public $post_title = '';
	public $post_name = '';
	public $post_type = 'post';
	public $post_status = 'publish';
	public $post_content = '';
	public $post_excerpt = '';
	public $menu_order = 0;
	public $classes = array();
	public $url = '';
}

class WP_Term {
	public $term_id = 0;
	public $name = '';
	public $slug = '';
	public $description = '';
	public $taxonomy = '';
	public $count = 0;
}

class WP_Error {
	private $message;
	public function __construct( $message = '' ) { $this->message = $message; }
	public function get_error_message() { return $this->message; }
}

class Walker_Nav_Menu {
	public function start_lvl( &$output, $depth = 0, $args = array() ) {}
	public function end_lvl( &$output, $depth = 0, $args = array() ) {}
	public function start_el( &$output, $item, $depth = 0, $args = array(), $id = 0 ) {}
	public function end_el( &$output, $item, $depth = 0, $args = array() ) {}
}

/* ------------------------------------------------------------- i18n & escape */

function __( $text, $domain = '' ) { return $text; }
function _e( $text, $domain = '' ) { echo $text; }
function esc_html__( $text, $domain = '' ) { return esc_html( $text ); }
function esc_attr__( $text, $domain = '' ) { return esc_attr( $text ); }
function esc_html_e( $text, $domain = '' ) { echo esc_html( $text ); }
function esc_attr_e( $text, $domain = '' ) { echo esc_attr( $text ); }
function _n( $single, $plural, $number, $domain = '' ) { return 1 === (int) $number ? $single : $plural; }
function esc_html( $text ) { return htmlspecialchars( (string) $text, ENT_QUOTES, 'UTF-8' ); }
function esc_attr( $text ) { return htmlspecialchars( (string) $text, ENT_QUOTES, 'UTF-8' ); }
function esc_textarea( $text ) { return esc_html( $text ); }
function esc_url( $url ) { return htmlspecialchars( (string) $url, ENT_QUOTES, 'UTF-8' ); }
function esc_url_raw( $url ) { return (string) $url; }
function wp_kses_post( $html ) { return $html; }
function wp_strip_all_tags( $html ) { return strip_tags( (string) $html ); }
function wpautop( $text ) { return '<p>' . $text . '</p>'; }
function number_format_i18n( $n ) { return number_format( (float) $n, 0, ',', '.' ); }
function sanitize_text_field( $v ) { return trim( strip_tags( (string) $v ) ); }
function sanitize_textarea_field( $v ) { return trim( strip_tags( (string) $v ) ); }
function sanitize_key( $v ) { return preg_replace( '/[^a-z0-9_\-]/', '', strtolower( (string) $v ) ); }
function sanitize_html_class( $v ) { return preg_replace( '/[^A-Za-z0-9_\-]/', '', (string) $v ); }
function sanitize_title( $v ) { return trim( preg_replace( '/-+/', '-', preg_replace( '/[^a-z0-9]+/', '-', strtolower( (string) $v ) ) ), '-' ); }
function wp_unslash( $v ) { return is_array( $v ) ? array_map( 'wp_unslash', $v ) : stripslashes( (string) $v ); }
function wp_json_encode( $v ) { return json_encode( $v, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES ); }
function wp_trim_words( $text, $words = 55, $more = '…' ) {
	$parts = preg_split( '/\s+/', trim( (string) $text ) );
	return count( $parts ) <= $words ? implode( ' ', $parts ) : implode( ' ', array_slice( $parts, 0, $words ) ) . $more;
}
function wp_parse_args( $args, $defaults = array() ) { return array_merge( $defaults, (array) $args ); }

/* ------------------------------------------------------------------- hooks */

function add_action( $hook, $cb, $priority = 10, $args = 1 ) { $GLOBALS['stub_actions'][ $hook ][] = $cb; }
function add_filter( $hook, $cb, $priority = 10, $args = 1 ) { $GLOBALS['stub_filters'][ $hook ][] = $cb; }
function do_action( $hook ) { foreach ( (array) ( $GLOBALS['stub_actions'][ $hook ] ?? array() ) as $cb ) { call_user_func( $cb ); } }
function add_shortcode( $tag, $cb ) { $GLOBALS['stub_shortcodes'][ $tag ] = $cb; }
function shortcode_exists( $tag ) { return isset( $GLOBALS['stub_shortcodes'][ $tag ] ); }
function shortcode_atts( $pairs, $atts, $tag = '' ) { return array_merge( $pairs, is_array( $atts ) ? $atts : array() ); }
function do_shortcode( $content ) {
	return preg_replace_callback(
		'/\[([a-z_\-]+)([^\]]*)\]/',
		static function ( $m ) {
			if ( ! isset( $GLOBALS['stub_shortcodes'][ $m[1] ] ) ) { return $m[0]; }
			$atts = array();
			if ( preg_match_all( '/(\w+)="([^"]*)"/', $m[2], $pairs, PREG_SET_ORDER ) ) {
				foreach ( $pairs as $pair ) { $atts[ $pair[1] ] = $pair[2]; }
			}
			return (string) call_user_func( $GLOBALS['stub_shortcodes'][ $m[1] ], $atts );
		},
		$content
	);
}
function register_activation_hook( $file, $cb ) {}
function register_deactivation_hook( $file, $cb ) {}
function flush_rewrite_rules() {}
function load_plugin_textdomain() { return true; }
function load_theme_textdomain() { return true; }
function plugin_dir_path( $file ) { return dirname( $file ) . '/'; }
function plugin_dir_url( $file ) { return 'https://example.test/wp-content/plugins/' . basename( dirname( $file ) ) . '/'; }
function plugin_basename( $file ) { return basename( dirname( $file ) ) . '/' . basename( $file ); }

/* ----------------------------------------------------------------- options */

function get_option( $key, $default = false ) { return $GLOBALS['stub_options'][ $key ] ?? $default; }
function update_option( $key, $value ) { $GLOBALS['stub_options'][ $key ] = $value; return true; }
function register_setting() {}
function settings_fields() { echo '<input type="hidden" name="option_page" value="stub">'; }
function submit_button( $text = 'Simpan' ) { echo '<p><button type="submit">' . esc_html( $text ) . '</button></p>'; }
function checked( $a, $b = true, $echo = true ) { $out = ( $a == $b ) ? ' checked' : ''; if ( $echo ) { echo $out; } return $out; }
function selected( $a, $b = true, $echo = true ) { $out = ( (string) $a === (string) $b ) ? ' selected' : ''; if ( $echo ) { echo $out; } return $out; }

/* ------------------------------------------------------------------- posts */

function stub_add_post( $args ) {
	$post = new WP_Post();
	foreach ( $args as $k => $v ) { $post->$k = $v; }
	$post->ID = $post->ID ?: count( $GLOBALS['stub_posts'] ) + 1;
	$post->url = 'https://example.test/' . $post->post_type . '/' . $post->post_name . '/';
	$GLOBALS['stub_posts'][ $post->ID ] = $post;
	return $post;
}
function stub_add_term( $args ) {
	$term = new WP_Term();
	foreach ( $args as $k => $v ) { $term->$k = $v; }
	$term->term_id = $term->term_id ?: count( $GLOBALS['stub_terms'] ) + 1;
	$GLOBALS['stub_terms'][ $term->term_id ] = $term;
	return $term;
}

function register_post_type( $type, $args = array() ) {}
function register_taxonomy( $tax, $types, $args = array() ) {}
function add_theme_support() {}
function add_image_size() {}
function register_nav_menus() {}
function has_nav_menu( $location ) { return false; }
function wp_nav_menu( $args = array() ) {}
function add_meta_box() {}
function wp_nonce_field() { echo '<input type="hidden" name="_wpnonce" value="stub">'; }
function wp_verify_nonce() { return true; }
function current_user_can() { return true; }
function get_current_screen() { return null; }
function add_menu_page() { return 'toplevel_page_accupro'; }
function add_submenu_page() { return 'accupro_page_stub'; }

function wp_insert_post( $args ) { return stub_add_post( $args )->ID; }
function wp_insert_term( $name, $tax, $args = array() ) {
	$term = stub_add_term( array( 'name' => $name, 'taxonomy' => $tax ) + $args );
	return array( 'term_id' => $term->term_id );
}
function term_exists( $slug, $tax = '' ) {
	foreach ( $GLOBALS['stub_terms'] as $term ) {
		if ( $term->slug === $slug ) { return array( 'term_id' => $term->term_id ); }
	}
	return null;
}
function wp_set_object_terms() { return true; }
function is_wp_error( $thing ) { return $thing instanceof WP_Error; }

function get_post( $post = null ) { return $post ? ( $GLOBALS['stub_posts'][ (int) $post ] ?? $GLOBALS['stub_post'] ) : $GLOBALS['stub_post']; }
function get_page_by_path( $slug, $output = OBJECT, $type = 'page' ) {
	foreach ( $GLOBALS['stub_posts'] as $post ) {
		if ( $post->post_name === $slug && ( 'page' === $type || $post->post_type === $type ) ) { return $post; }
	}
	return null;
}
function get_posts( $args = array() ) {
	$type  = $args['post_type'] ?? 'post';
	$limit = (int) ( $args['posts_per_page'] ?? -1 );
	$out   = array();

	foreach ( $GLOBALS['stub_posts'] as $post ) {
		if ( $post->post_type !== $type ) { continue; }

		if ( isset( $args['tax_query'][0]['terms'] ) ) {
			$want = $args['tax_query'][0]['terms'];
			if ( ( $GLOBALS['stub_meta'][ $post->ID ]['_cat'] ?? '' ) !== $want ) { continue; }
		}

		if ( ! empty( $args['title'] ) && $post->post_title !== $args['title'] ) { continue; }

		if ( isset( $args['meta_query'][0] ) ) {
			$q = $args['meta_query'][0];
			if ( ( $GLOBALS['stub_meta'][ $post->ID ][ $q['key'] ] ?? '' ) !== $q['value'] ) { continue; }
		}

		$out[] = $post;
	}

	return $limit > 0 ? array_slice( $out, 0, $limit ) : $out;
}
function wp_count_posts( $type ) {
	$n = 0;
	foreach ( $GLOBALS['stub_posts'] as $post ) { if ( $post->post_type === $type ) { $n++; } }
	return (object) array( 'publish' => $n );
}
function get_post_meta( $id, $key = '', $single = false ) { return $GLOBALS['stub_meta'][ $id ][ $key ] ?? ''; }
function update_post_meta( $id, $key, $value ) { $GLOBALS['stub_meta'][ $id ][ $key ] = $value; return true; }
function get_term_meta( $id, $key = '', $single = false ) { return $GLOBALS['stub_term_meta'][ $id ][ $key ] ?? ''; }
function update_term_meta( $id, $key, $value ) { $GLOBALS['stub_term_meta'][ $id ][ $key ] = $value; return true; }
function get_post_status( $id ) { return isset( $GLOBALS['stub_posts'][ $id ] ) ? $GLOBALS['stub_posts'][ $id ]->post_status : false; }

function post_type_exists( $type ) { return in_array( $type, array( 'layanan', 'testimonial', 'team', 'alat', 'post', 'page' ), true ); }
function get_post_type_object( $type ) { return null; }
function wp_get_object_terms( $id, $tax, $args = array() ) { return isset( $GLOBALS['stub_meta'][ $id ]['_cat'] ) ? array( $GLOBALS['stub_meta'][ $id ]['_cat'] ) : array(); }
function get_terms( $args = array() ) {
	$tax = $args['taxonomy'] ?? '';
	$out = array();
	foreach ( $GLOBALS['stub_terms'] as $term ) { if ( $term->taxonomy === $tax ) { $out[] = $term; } }
	return $out;
}
function get_term_link( $term ) { return 'https://example.test/layanan-kategori/' . $term->slug . '/'; }
function get_the_terms( $id, $tax ) {
	$slug = $GLOBALS['stub_meta'][ $id ]['_cat'] ?? '';
	foreach ( $GLOBALS['stub_terms'] as $term ) { if ( $term->slug === $slug ) { return array( $term ); } }
	return false;
}

function get_permalink( $post = null ) {
	if ( is_object( $post ) ) { return $post->url; }
	if ( $post && isset( $GLOBALS['stub_posts'][ (int) $post ] ) ) { return $GLOBALS['stub_posts'][ (int) $post ]->url; }
	return $GLOBALS['stub_post'] ? $GLOBALS['stub_post']->url : 'https://example.test/';
}
function the_permalink() { echo esc_url( get_permalink() ); }
function get_the_title( $post = null ) {
	if ( is_object( $post ) ) { return $post->post_title; }
	if ( $post && isset( $GLOBALS['stub_posts'][ (int) $post ] ) ) { return $GLOBALS['stub_posts'][ (int) $post ]->post_title; }
	return $GLOBALS['stub_post'] ? $GLOBALS['stub_post']->post_title : '';
}
function the_title() { echo esc_html( get_the_title() ); }
function get_the_ID() { return $GLOBALS['stub_post'] ? $GLOBALS['stub_post']->ID : 0; }
function get_the_content() { return $GLOBALS['stub_post'] ? $GLOBALS['stub_post']->post_content : ''; }
// WordPress asli menjalankan do_shortcode() pada filter the_content, jadi
// tiruan ini harus melakukannya juga — kalau tidak, shortcode di dalam isi
// halaman terlihat gagal padahal di situs sungguhan berjalan.
function the_content() { echo wpautop( do_shortcode( get_the_content() ) ); }
function strip_shortcodes( $content ) { return preg_replace( '/\[[a-z_\-][^\]]*\]/', '', (string) $content ); }
function get_the_excerpt( $post = null ) {
	$p = is_object( $post ) ? $post : $GLOBALS['stub_post'];
	if ( ! $p ) { return ''; }
	// wp_trim_excerpt() membuang shortcode sebelum memotong teks.
	return $p->post_excerpt ?: wp_trim_words( strip_tags( strip_shortcodes( $p->post_content ) ), 24 );
}
function get_the_date() { return '1 September 2026'; }
function get_the_archive_title() { return 'Arsip'; }
function get_the_archive_description() { return ''; }
function post_type_archive_title( $prefix = '', $display = true ) {
	$title = 'Layanan';
	if ( $display ) { echo esc_html( $title ); }
	return $title;
}
function get_post_type_archive_link( $type ) { return 'https://example.test/' . $type . '/'; }
function get_queried_object() { return $GLOBALS['stub_queried']; }
function get_search_query() { return 'pajak'; }
function paginate_links( $args = array() ) { return ''; }
function wp_link_pages( $args = array() ) {}

function have_posts() { return ! empty( $GLOBALS['stub_queue'] ); }
function the_post() { $GLOBALS['stub_post'] = array_shift( $GLOBALS['stub_queue'] ); }

function is_front_page() { return 'front' === $GLOBALS['stub_context']; }
function is_search() { return 'search' === $GLOBALS['stub_context']; }
function is_archive() { return 'archive' === $GLOBALS['stub_context']; }
function is_singular( $type = '' ) { return 'single' === $GLOBALS['stub_context'] && ( ! $type || ( $GLOBALS['stub_post'] && $GLOBALS['stub_post']->post_type === $type ) ); }

/* ------------------------------------------------------------------ output */

function home_url( $path = '/' ) { return 'https://example.test' . $path; }
function bloginfo( $key ) { echo esc_html( get_bloginfo( $key ) ); }
function get_bloginfo( $key ) { return 'charset' === $key ? 'UTF-8' : 'Accupro'; }
function language_attributes() { echo 'lang="id-ID"'; }
function body_class( $extra = '' ) {
	$classes = array( 'stub' );
	foreach ( (array) ( $GLOBALS['stub_filters']['body_class'] ?? array() ) as $cb ) { $classes = call_user_func( $cb, $classes ); }
	echo 'class="' . esc_attr( implode( ' ', $classes ) ) . '"';
}
function wp_head() { echo "<!-- wp_head -->\n"; }
function wp_footer() { echo "<!-- wp_footer -->\n"; }
function wp_body_open() {}
function get_header() { require dirname( __DIR__ ) . '/accupro-theme/header.php'; }
function get_footer() { require dirname( __DIR__ ) . '/accupro-theme/footer.php'; }
function get_template_directory() { return dirname( __DIR__ ) . '/accupro-theme'; }
function get_template_directory_uri() { return 'https://example.test/wp-content/themes/accupro'; }
function get_stylesheet_uri() { return 'https://example.test/wp-content/themes/accupro/style.css'; }
function wp_enqueue_style() {}
function wp_enqueue_script() {}
function wp_enqueue_media() {}
function wp_add_inline_script() {}
function wp_localize_script() {}

function has_post_thumbnail( $id = null ) { return ! empty( $GLOBALS['stub_meta'][ $id ]['_thumb'] ); }
function get_the_post_thumbnail( $id = null, $size = '', $attr = array() ) {
	return '<img src="https://example.test/foto.jpg" alt="" width="800" height="600">';
}
function wp_get_attachment_image( $id, $size = '', $icon = false, $attr = array() ) {
	return $id ? '<img src="https://example.test/lampiran-' . (int) $id . '.jpg" alt="" width="800" height="600">' : '';
}

function wp_get_attachment_metadata( $id ) { return $id ? array( 'width' => 1600, 'height' => 1200, 'sizes' => array() ) : false; }
function get_post_thumbnail_id( $id = null ) { return ! empty( $GLOBALS['stub_meta'][ $id ]['_thumb'] ) ? (int) $GLOBALS['stub_meta'][ $id ]['_thumb'] : 0; }
function get_attached_file( $id ) { return '/tmp/berkas-' . (int) $id . '.jpg'; }

function get_theme_mod( $name, $default = false ) { return $default; }
function get_custom_logo() { return ''; }
function wp_parse_url( $url, $component = -1 ) { return parse_url( $url, $component ); }
function add_query_arg() { return $GLOBALS['stub_current_path'] ?? '/'; }
