<?php
/**
 * Uji asap tema + plugin Accupro.
 *
 * Jalankan: php wordpress/tests/smoke.php
 *
 * Setiap peringatan atau notice PHP diperlakukan sebagai kegagalan, bukan
 * sekadar catatan — di WordPress asli, notice "undefined array key" yang
 * dibiarkan biasanya jadi tanda ada data yang dianggap ada padahal tidak.
 *
 * @package Accupro
 */

// phpcs:disable

require __DIR__ . '/stub-wp.php';

error_reporting( E_ALL );
set_error_handler(
	static function ( $no, $str, $file, $line ) {
		throw new ErrorException( $str, 0, $no, $file, $line );
	}
);

$root    = dirname( __DIR__ );
$plugin  = $root . '/accupro-core';
$theme   = $root . '/accupro-theme';
$failed  = 0;
$checks  = 0;

/**
 * Cetak hasil satu pemeriksaan.
 */
function stub_report( $ok, $label, $detail = '' ) {
	global $failed, $checks;
	$checks++;
	if ( ! $ok ) { $failed++; }
	printf( "%s %s%s\n", $ok ? '  ok  ' : ' FAIL ', $label, $detail ? " — $detail" : '' );
}

/* -------------------------------------------------------------- muat kode */

define( 'ACCUPRO_CORE_VERSION', '1.0.0' );
define( 'ACCUPRO_CORE_FILE', $plugin . '/accupro-core.php' );
define( 'ACCUPRO_CORE_PATH', $plugin . '/' );
define( 'ACCUPRO_CORE_URL', 'https://example.test/wp-content/plugins/accupro-core/' );

foreach ( array( 'helpers', 'post-types', 'taxonomies', 'metaboxes', 'settings', 'admin-media', 'seed', 'shortcodes' ) as $file ) {
	require $plugin . '/inc/' . $file . '.php';
}

require $theme . '/inc/icons.php';
require $theme . '/inc/media.php';
require $theme . '/inc/template-tags.php';
require $theme . '/inc/tool-forms.php';
require $theme . '/functions.php';

echo "== plugin ==\n";
stub_report( function_exists( 'accupro_get_option' ), 'helper termuat' );
stub_report( function_exists( 'accupro_seed_default_content' ), 'seeder termuat' );
stub_report( count( $GLOBALS['stub_shortcodes'] ) >= 7, 'shortcode terdaftar', count( $GLOBALS['stub_shortcodes'] ) . ' shortcode' );

/* ------------------------------------------------------------ jalankan seed */

accupro_seed_default_content();

$settings = get_option( 'accupro_settings' );
stub_report( ! empty( $settings['legal_name'] ), 'seed: nama perusahaan', $settings['legal_name'] ?? '' );
stub_report( ! empty( $settings['whatsapp'] ), 'seed: nomor WhatsApp', $settings['whatsapp'] ?? '' );
stub_report( count( $settings['hero_slides'] ?? array() ) > 0, 'seed: slide hero', count( $settings['hero_slides'] ?? array() ) . ' slide' );
stub_report( count( $settings['pillars'] ?? array() ) > 0, 'seed: pilar', count( $settings['pillars'] ?? array() ) . ' pilar' );
stub_report( ! empty( $settings['cta_heading'] ), 'seed: judul CTA' );

$services = get_posts( array( 'post_type' => 'layanan', 'posts_per_page' => -1 ) );
stub_report( 24 === count( $services ), 'seed: 24 layanan', count( $services ) . ' layanan' );

$tools = get_posts( array( 'post_type' => 'alat', 'posts_per_page' => -1 ) );
stub_report( 9 === count( $tools ), 'seed: 9 alat hitung', count( $tools ) . ' alat' );

$terms = get_terms( array( 'taxonomy' => 'kategori_layanan' ) );
stub_report( 5 === count( $terms ), 'seed: 5 kategori', count( $terms ) . ' kategori' );

$testimonials = get_posts( array( 'post_type' => 'testimonial', 'posts_per_page' => -1 ) );
stub_report( count( $testimonials ) > 0, 'seed: testimoni', count( $testimonials ) . ' testimoni' );

stub_report( null !== get_page_by_path( 'tentang-kami' ), 'seed: halaman Tentang Kami' );
stub_report( null !== get_page_by_path( 'kontak' ), 'seed: halaman Kontak' );
stub_report( false !== strpos( accupro_contact_url(), '/kontak/' ), 'tombol kontak menuju halaman Kontak', accupro_contact_url() );

// Seeder harus idempoten: dijalankan dua kali tidak menggandakan apa pun.
accupro_seed_default_content();
stub_report(
	count( get_posts( array( 'post_type' => 'layanan', 'posts_per_page' => -1 ) ) ) === count( $services ),
	'seed dua kali tidak menggandakan layanan'
);

/* -------------------------------------------- lengkapi relasi untuk render */

// Stub get_posts menyaring lewat meta _cat; isi dari data seed.
$data  = accupro_seed_data();
$slugs = accupro_seed_service_slugs();
foreach ( $data['services'] as $service ) {
	$slug = $slugs[ $service['slug'] ] ?? $service['slug'];
	$post = get_page_by_path( $slug, OBJECT, 'layanan' );
	if ( $post ) { update_post_meta( $post->ID, '_cat', $service['cat'] ); }
}

// Slug layanan harus memakai slug WordPress yang asli, bukan slug JSON —
// kalau tidak, seeder akan menggandakan 24 layanan di situs yang sudah ada.
stub_report( 24 === count( $slugs ), 'peta slug layanan lengkap', count( $slugs ) . '/24' );
$live = get_page_by_path( 'pengurusan-pajak-badan', OBJECT, 'layanan' );
stub_report( null !== $live, 'layanan dibuat dengan slug Indonesia', $live ? $live->post_title : '-' );
stub_report( null === get_page_by_path( 'corporate-tax-processing', OBJECT, 'layanan' ), 'tidak ada layanan berslug Inggris' );
foreach ( $GLOBALS['stub_terms'] as $term ) {
	foreach ( $data['categories'] as $cat ) {
		if ( $term->name === $cat['name'] ) { $term->slug = $cat['slug']; }
	}
}

$bridged = 0;
foreach ( $tools as $tool ) {
	if ( get_post_meta( $tool->ID, 'accupro_bridge_post', true ) ) { $bridged++; }
}
stub_report( 9 === $bridged, 'seed: setiap alat punya layanan pendamping', $bridged . '/9' );

/* ------------------------------------------------------------ tema: ikon */

echo "\n== tema ==\n";
stub_report( '' !== accupro_icon( 'chart', 20 ), 'ikon chart' );
stub_report( '' === accupro_icon( 'tidak-ada' ), 'ikon tak dikenal aman (kosong)' );

foreach ( accupro_icon_choices() as $key => $label ) {
	if ( '' === accupro_icon( $key ) ) {
		stub_report( false, 'ikon pilihan admin tersedia di tema', $key );
	}
}
stub_report( true, 'semua ikon pilihan admin ada di set tema' );

foreach ( array_keys( accupro_seed_tool_bridges() ) as $slug ) {
	stub_report( '' !== accupro_tool_form( $slug ), 'form alat: ' . $slug );
}
stub_report( '' === accupro_tool_form( 'kode-ngawur' ), 'kode alat tak dikenal aman (kosong)' );

/* ---------------------------------------------------------- render template */

echo "\n== render ==\n";

/**
 * Jalankan satu template, kembalikan HTML-nya.
 */
function stub_render( $file, $context, $queue = array(), $queried = null ) {
	$GLOBALS['stub_context'] = $context;
	$GLOBALS['stub_queue']   = $queue;
	$GLOBALS['stub_post']    = $queue ? $queue[0] : null;
	$GLOBALS['stub_queried'] = $queried;

	ob_start();
	require $file;
	return ob_get_clean();
}

$theme_files = array(
	'front-page.php'                 => array( 'front', array() ),
	'archive-layanan.php'            => array( 'archive', array() ),
	'taxonomy-kategori_layanan.php'  => array( 'archive', array() ),
	'single-layanan.php'             => array( 'single', array() ),
	'archive-alat.php'               => array( 'archive', array() ),
	'single-alat.php'                => array( 'single', array() ),
	'page.php'                       => array( 'single', array() ),
	'single.php'                     => array( 'single', array() ),
	'index.php'                      => array( 'archive', array() ),
	'404.php'                        => array( 'archive', array() ),
);

$service_post = get_page_by_path( 'pengurusan-pajak-badan', OBJECT, 'layanan' );
$tool_post    = get_page_by_path( 'pph4-2', OBJECT, 'alat' );
$page_post    = get_page_by_path( 'kontak' );
$article_post = stub_add_post( array( 'post_type' => 'post', 'post_name' => 'artikel-uji', 'post_title' => 'Artikel Uji', 'post_content' => 'Isi artikel.' ) );
$first_term   = $GLOBALS['stub_terms'][ array_key_first( $GLOBALS['stub_terms'] ) ];

$queues = array(
	'single-layanan.php'            => array( $service_post ),
	'single-alat.php'               => array( $tool_post ),
	'page.php'                      => array( $page_post ),
	'single.php'                    => array( $article_post ),
	'index.php'                     => array( $article_post ),
	'taxonomy-kategori_layanan.php' => array(),
);

$html = array();

foreach ( $theme_files as $file => $setup ) {
	$queue   = $queues[ $file ] ?? array();
	$queried = 'taxonomy-kategori_layanan.php' === $file ? $first_term : null;

	try {
		$out = stub_render( $theme . '/' . $file, $setup[0], $queue, $queried );
		$html[ $file ] = $out;
		stub_report( strlen( $out ) > 500, $file, strlen( $out ) . ' bytes' );
	} catch ( Throwable $e ) {
		stub_report( false, $file, get_class( $e ) . ': ' . $e->getMessage() . ' @ ' . basename( $e->getFile() ) . ':' . $e->getLine() );
	}
}

/* ----------------------------------------------------------- isi keluaran */

echo "\n== isi halaman ==\n";

$home = $html['front-page.php'] ?? '';
stub_report( substr_count( $home, 'class="hero__slide ' ) >= 3, 'beranda: slide hero terender', substr_count( $home, 'class="hero__slide ' ) . ' slide' );
stub_report( substr_count( $home, 'hero__frame-slide' ) === substr_count( $home, 'class="hero__slide ' ), 'beranda: jumlah gambar hero = jumlah slide' );
stub_report( false !== strpos( $home, 'id="finder"' ), 'beranda: pencari layanan ada' );
stub_report( substr_count( $home, 'data-cat=' ) >= 24, 'beranda: 24 layanan di pencari', substr_count( $home, 'data-cat=' ) . ' option' );
stub_report( false !== strpos( $home, 'wa.me/62' ), 'beranda: WhatsApp format internasional' );
stub_report( false === strpos( $home, '[accupro' ), 'beranda: tidak ada shortcode tersisa' );
stub_report( false !== strpos( $home, 'utility-bar' ), 'beranda: bar utilitas (section 1) ada' );

$tool = $html['single-alat.php'] ?? '';
stub_report( false !== strpos( $tool, 'data-tool="pph4-2"' ), 'alat: data-tool terpasang' );
stub_report( false !== strpos( $tool, 'id="result-headline"' ), 'alat: panel hasil ada' );
stub_report( false !== strpos( $tool, 'id="calc-history"' ), 'alat: riwayat ada' );
stub_report( false !== strpos( $tool, 'constructionExecutionQualified' ), 'alat: opsi PPh 4(2) sesuai calculators.js' );

$services_page = $html['archive-layanan.php'] ?? '';
stub_report( substr_count( $services_page, 'data-name=' ) === 24, 'katalog: 24 kartu layanan', substr_count( $services_page, 'data-name=' ) . ' kartu' );
stub_report( substr_count( $services_page, 'data-group=' ) === 5, 'katalog: 5 grup kategori' );
stub_report( false !== strpos( $services_page, 'id="service-search"' ), 'katalog: kolom pencarian ada' );

$page = $html['page.php'] ?? '';
stub_report( false === strpos( $page, '[accupro_kontak]' ), 'halaman: shortcode kontak diproses' );

/* --------------------------------------------------- Section 1 berlatar */

echo "\n== section 1 ==\n";

// Setiap halaman harus punya Section 1 berlatar foto, bukan foto di kolom
// sebelah teks seperti versi statis.
foreach ( array( 'front-page.php', 'archive-layanan.php', 'taxonomy-kategori_layanan.php',
                 'single-layanan.php', 'archive-alat.php', 'single-alat.php',
                 'page.php', 'single.php', 'index.php' ) as $file ) {
	$out = $html[ $file ] ?? '';
	$bg  = ( false !== strpos( $out, 'pagehero--bg' ) ) || ( false !== strpos( $out, 'hero--bg' ) );
	stub_report( $bg, 'section 1 berlatar: ' . $file );
}

// Kolom foto lama tidak boleh tersisa di mana pun.
$leftover_frame = array();
foreach ( $html as $file => $out ) {
	if ( false !== strpos( $out, 'pagehero__frame' ) || false !== strpos( $out, 'hero__media' ) ) {
		$leftover_frame[] = $file;
	}
}
stub_report( ! $leftover_frame, 'tidak ada sisa kolom foto lama', implode( ', ', $leftover_frame ) );

// Nama alat dan kategori harus bahasa Indonesia — itu bahasa dasar situs.
$labels = accupro_seed_tool_labels();
stub_report( 9 === count( $labels ), 'nama 9 alat tersedia dalam bahasa Indonesia', count( $labels ) . '/9' );
$en_tool = array_filter( $labels, static function ( $l ) { return false !== stripos( $l['name'], 'Calculator' ) || false !== stripos( $l['name'], 'Checker' ); } );
stub_report( ! $en_tool, 'tidak ada nama alat berbahasa Inggris' );

$cats = accupro_seed_category_labels();
stub_report( 5 === count( $cats ), 'nama 5 kategori dalam bahasa Indonesia', count( $cats ) . '/5' );
$en_cat = array_filter( $cats, static function ( $l ) { return false !== stripos( $l['name'], 'Tax' ) || false !== stripos( $l['name'], 'Trademark' ); } );
stub_report( ! $en_cat, 'tidak ada nama kategori berbahasa Inggris' );

/* ---------------------------------------------------------- teks tak lolos */

echo "\n== bahasa ==\n";

// Teks depan harus lewat __(): dicek dengan mencari kata Inggris yang dulu ada
// di versi statis dan seharusnya sudah diterjemahkan.
$leftovers = array( 'Calculate', 'Reset', 'Copy result', 'Calculation history', 'Service finder', 'Browse by need', 'What clients say' );
$found     = array();

foreach ( $html as $file => $out ) {
	foreach ( $leftovers as $word ) {
		if ( false !== strpos( $out, '>' . $word ) ) { $found[] = "$file: $word"; }
	}
}
stub_report( ! $found, 'tidak ada teks Inggris sisa versi statis', implode( ', ', $found ) );

/* --------------------------------------------------- aset tema vs statis */

echo "\n== aset ==\n";

// Tema memakai SALINAN css/js dari dist/assets. Kalau salah satu diedit tanpa
// yang lain, versi WordPress dan versi statis diam-diam jadi berbeda — dan itu
// baru ketahuan sebagai bug tampilan berminggu-minggu kemudian.
foreach ( array( 'css/style.css', 'js/main.js', 'js/calculators.js' ) as $asset ) {
	$static = dirname( dirname( __DIR__ ) ) . '/dist/assets/' . $asset;
	$themed = dirname( __DIR__ ) . '/accupro-theme/assets/' . $asset;

	if ( ! file_exists( $static ) ) {
		stub_report( true, 'aset statis tidak ada, lewati: ' . $asset );
		continue;
	}

	stub_report( md5_file( $static ) === md5_file( $themed ), 'aset tema sama dengan dist/: ' . $asset );
}

/* ------------------------------------------------------------------ ringkas */

printf( "\n%d pemeriksaan, %d gagal\n", $checks, $failed );
exit( $failed ? 1 : 0 );
