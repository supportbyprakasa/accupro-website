<?php
/**
 * Blok tampilan yang dipakai berulang di banyak template.
 *
 * Setiap fungsi di sini mencetak langsung (echo), bukan mengembalikan string,
 * kecuali yang namanya diakhiri _html.
 *
 * @package Accupro
 */

defined( 'ABSPATH' ) || exit;

/**
 * Nilai pengaturan, aman dipanggil walau plugin Accupro Core tidak aktif.
 *
 * @param string $key     Kunci.
 * @param mixed  $default Nilai bila kosong.
 * @return mixed
 */
function accupro_opt( $key, $default = '' ) {
	return function_exists( 'accupro_get_option' ) ? accupro_get_option( $key, $default ) : $default;
}

/**
 * Grup berulang, aman tanpa plugin.
 *
 * @param string $key Kunci grup.
 * @return array
 */
function accupro_rows( $key ) {
	return function_exists( 'accupro_get_group' ) ? accupro_get_group( $key ) : array();
}

/**
 * Bar utilitas di atas header.
 *
 * Ini Section 1 di setiap halaman situs lama — email, jam kerja, lalu tautan
 * sosial, selalu dalam urutan itu. Isinya konten nyata, bukan hiasan, jadi
 * tetap di atas header, bukan hanya di footer.
 */
function accupro_utility_bar() {
	$email = accupro_opt( 'email_1' );
	$hours = accupro_opt( 'hours' );
	$socials = function_exists( 'accupro_social_links' ) ? accupro_social_links() : array();

	if ( ! $email && ! $hours && ! $socials ) {
		return;
	}

	$icon_map = array(
		'instagram' => 'ig',
		'facebook'  => 'fb',
		'linkedin'  => 'li',
		'tiktok'    => 'tt',
	);
	?>
	<div class="utility-bar"><div class="container utility-bar__row">
		<?php if ( $email ) : ?>
			<a href="mailto:<?php echo esc_attr( $email ); ?>"><?php echo accupro_icon( 'mail', 14 ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?> <?php echo esc_html( $email ); ?></a>
		<?php endif; ?>

		<?php if ( $hours ) : ?>
			<span class="utility-bar__hours"><?php echo accupro_icon( 'clock', 14 ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?> <?php echo esc_html( $hours ); ?></span>
		<?php endif; ?>

		<?php if ( $socials ) : ?>
			<span class="utility-bar__socials">
				<?php foreach ( $socials as $key => $social ) : ?>
					<a href="<?php echo esc_url( $social['url'] ); ?>" target="_blank" rel="noopener" aria-label="<?php echo esc_attr( $social['label'] ); ?>">
						<?php echo accupro_icon( isset( $icon_map[ $key ] ) ? $icon_map[ $key ] : 'globe', 15 ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
					</a>
				<?php endforeach; ?>
			</span>
		<?php endif; ?>
	</div></div>
	<?php
}

/**
 * Pemilih bahasa.
 *
 * Situs ini memakai TranslatePress untuk id / en / ch, dan TranslatePress
 * menyediakan shortcode-nya sendiri. Kalau plugin itu tidak aktif, tidak ada
 * yang dicetak — lebih baik kosong daripada tiga tautan yang menuju halaman
 * yang tidak ada.
 */
function accupro_language_switcher() {
	if ( ! shortcode_exists( 'language-switcher' ) ) {
		return;
	}

	echo '<div class="langs" aria-label="' . esc_attr__( 'Bahasa', 'accupro' ) . '">';
	echo do_shortcode( '[language-switcher]' );
	echo '</div>';
}

/**
 * Menu utama.
 *
 * Kalau admin belum memasang menu di Tampilan > Menu, daftar bawaan di bawah
 * dipakai supaya navigasi tidak pernah kosong.
 */
function accupro_primary_nav() {
	if ( has_nav_menu( 'primary' ) ) {
		wp_nav_menu(
			array(
				'theme_location' => 'primary',
				'container'      => false,
				'items_wrap'     => '%3$s',
				'depth'          => 1,
				'link_before'    => '',
				'fallback_cb'    => false,
				'walker'         => new Accupro_Nav_Walker(),
			)
		);
		return;
	}

	foreach ( accupro_fallback_nav() as $url => $label ) {
		if ( ! $url ) {
			continue;
		}

		printf(
			'<a class="nav__link" href="%1$s"%2$s>%3$s</a>',
			esc_url( $url ),
			accupro_nav_is_current( $url ) ? ' aria-current="page"' : '',
			esc_html( $label )
		);
	}
}

/**
 * Menu bawaan, dipakai selama admin belum memasang menu sendiri.
 *
 * Isinya sama persis dengan menu situs yang sedang berjalan — Home, Tentang
 * Kami, Layanan, Kontak — supaya pengunjung tidak menemukan navigasi yang
 * berbeda setelah tema diganti. Alat Hitung ditambahkan karena halaman itu
 * baru dan belum ada di menu lama.
 *
 * @return array<string,string> url => label
 */
function accupro_fallback_nav() {
	$about = get_page_by_path( 'tentang-kami' );

	$items = array( home_url( '/' ) => __( 'Home', 'accupro' ) );

	if ( $about ) {
		$items[ get_permalink( $about ) ] = __( 'Tentang Kami', 'accupro' );
	}

	$services = get_post_type_archive_link( 'layanan' );
	if ( $services ) {
		$items[ $services ] = __( 'Layanan', 'accupro' );
	}

	$tools = get_post_type_archive_link( 'alat' );
	if ( $tools ) {
		$items[ $tools ] = __( 'Alat Hitung', 'accupro' );
	}

	$items[ accupro_contact_url() ] = __( 'Kontak', 'accupro' );

	return $items;
}

/**
 * Walker menu: menghasilkan <a class="nav__link"> polos, tanpa <ul>/<li>,
 * karena CSS tema memakai flexbox langsung di atas tautannya.
 */
class Accupro_Nav_Walker extends Walker_Nav_Menu {

	/**
	 * Tidak ada level bersarang yang dicetak.
	 *
	 * @param string $output Output.
	 * @param int    $depth  Kedalaman.
	 * @param array  $args   Argumen.
	 */
	public function start_lvl( &$output, $depth = 0, $args = array() ) {}

	/**
	 * Tidak ada level bersarang yang ditutup.
	 *
	 * @param string $output Output.
	 * @param int    $depth  Kedalaman.
	 * @param array  $args   Argumen.
	 */
	public function end_lvl( &$output, $depth = 0, $args = array() ) {}

	/**
	 * Satu item menu.
	 *
	 * @param string  $output Output.
	 * @param WP_Post $item   Item menu.
	 * @param int     $depth  Kedalaman.
	 * @param array   $args   Argumen.
	 * @param int     $id     ID.
	 */
	public function start_el( &$output, $item, $depth = 0, $args = array(), $id = 0 ) {
		$current = in_array( 'current-menu-item', (array) $item->classes, true )
			|| in_array( 'current-menu-parent', (array) $item->classes, true )
			|| in_array( 'current_page_parent', (array) $item->classes, true );

		$output .= sprintf(
			'<a class="nav__link" href="%1$s"%2$s>%3$s</a>',
			esc_url( $item->url ),
			$current ? ' aria-current="page"' : '',
			esc_html( $item->title )
		);
	}

	/**
	 * Tidak ada penutup tambahan.
	 *
	 * @param string  $output Output.
	 * @param WP_Post $item   Item.
	 * @param int     $depth  Kedalaman.
	 * @param array   $args   Argumen.
	 */
	public function end_el( &$output, $item, $depth = 0, $args = array() ) {}
}

/**
 * Breadcrumb.
 *
 * @param array $trail Daftar array( 'label' => '', 'url' => '' ). Item terakhir
 *                     tanpa url dianggap halaman saat ini.
 */
function accupro_breadcrumbs( $trail ) {
	if ( ! $trail ) {
		return;
	}

	$last = count( $trail ) - 1;
	?>
	<nav class="crumbs" aria-label="<?php esc_attr_e( 'Remah roti', 'accupro' ); ?>"><ol>
		<?php foreach ( $trail as $i => $crumb ) : ?>
			<li>
				<?php if ( $i === $last || empty( $crumb['url'] ) ) : ?>
					<span aria-current="page"><?php echo esc_html( $crumb['label'] ); ?></span>
				<?php else : ?>
					<a href="<?php echo esc_url( $crumb['url'] ); ?>"><?php echo esc_html( $crumb['label'] ); ?></a><span aria-hidden="true">/</span>
				<?php endif; ?>
			</li>
		<?php endforeach; ?>
	</ol></nav>
	<?php
}

/**
 * Section 1 setiap halaman: judul di atas foto yang jadi latar.
 *
 * Sebelumnya teks dan foto berdampingan dalam dua kolom. Sekarang fotonya jadi
 * latar section, dengan gradien gelap di atasnya supaya teks tetap terbaca —
 * gradien itu bukan hiasan; tanpa itu judul putih bisa jatuh di atas bagian
 * foto yang terang lalu hilang.
 *
 * Breadcrumb ikut masuk ke dalam section, bukan di atasnya, supaya tidak ada
 * jalur tipis berlatar putih yang memisahkan header dari banner.
 *
 * Kalau belum ada gambar, section tetap dirender dengan warna navy — tinggi
 * dan tata letaknya sama persis, jadi halaman tidak melompat begitu gambarnya
 * diisi.
 *
 * @param array $args crumbs, kicker (HTML), heading, lede, extra (HTML),
 *                    image (ID lampiran), image_label.
 */
function accupro_page_banner( $args ) {
	$args = wp_parse_args(
		$args,
		array(
			'crumbs'      => array(),
			'kicker'      => '',
			'heading'     => '',
			'lede'        => '',
			'extra'       => '',
			'image'       => 0,
			'image_label' => '',
		)
	);
	?>
	<section class="pagehero pagehero--bg">
		<?php echo accupro_section_bg( $args['image'], array( 'label' => $args['image_label'] ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
		<div class="container pagehero__inner">
			<?php accupro_breadcrumbs( $args['crumbs'] ); ?>
			<?php echo $args['kicker']; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
			<h1><?php echo esc_html( $args['heading'] ); ?></h1>
			<?php if ( $args['lede'] ) : ?>
				<p class="lede"><?php echo esc_html( $args['lede'] ); ?></p>
			<?php endif; ?>
			<?php echo $args['extra']; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
		</div>
	</section>
	<?php
}

/**
 * Pita ajakan konsultasi gratis, dipakai di bawah hampir semua halaman.
 */
function accupro_cta_band() {
	$heading = accupro_opt( 'cta_heading' );
	$text    = accupro_opt( 'cta_text' );

	if ( ! $heading && ! $text ) {
		return;
	}

	$wa       = function_exists( 'accupro_whatsapp_url' ) ? accupro_whatsapp_url() : '';
	$wa_label = accupro_opt( 'whatsapp' );
	$contact  = accupro_contact_url();
	?>
	<section class="section section--navy">
		<div class="container split split--wide">
			<div class="stack" style="--s:18px">
				<span class="eyebrow eyebrow--gold"><?php esc_html_e( 'Konsultasi gratis', 'accupro' ); ?></span>
				<?php if ( $heading ) : ?>
					<h2><?php echo esc_html( $heading ); ?></h2>
				<?php endif; ?>
				<?php if ( $text ) : ?>
					<p class="lede" style="color:#C3C7E6"><?php echo esc_html( $text ); ?></p>
				<?php endif; ?>
				<div class="cluster">
					<?php if ( $wa ) : ?>
						<a class="btn btn--gold" href="<?php echo esc_url( $wa ); ?>" target="_blank" rel="noopener">
							<?php echo accupro_icon( 'whatsapp', 18 ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
							<?php echo esc_html( $wa_label ? $wa_label : __( 'WhatsApp', 'accupro' ) ); ?>
						</a>
					<?php endif; ?>
					<?php if ( $contact ) : ?>
						<a class="btn btn--onnavy" href="<?php echo esc_url( $contact ); ?>">
							<?php esc_html_e( 'Kirim pertanyaan', 'accupro' ); ?> <?php echo accupro_icon( 'arrow', 17 ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
						</a>
					<?php endif; ?>
				</div>
			</div>
			<?php echo accupro_attachment_media( accupro_opt( 'cta_image', 0 ), '4 / 3', array( 'label' => __( 'Foto konsultasi dengan klien', 'accupro' ) ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
		</div>
	</section>
	<?php
}

/**
 * URL halaman kontak.
 *
 * Dicari sekali lewat slug 'kontak' lalu 'contact'; kalau tidak ada, jatuh ke
 * beranda supaya tombolnya tidak pernah menuju 404.
 *
 * @return string
 */
function accupro_contact_url() {
	static $url = null;

	if ( null !== $url ) {
		return $url;
	}

	foreach ( array( 'kontak', 'contact', 'hubungi-kami' ) as $slug ) {
		$page = get_page_by_path( $slug );

		if ( $page ) {
			$url = get_permalink( $page );
			return $url;
		}
	}

	$url = home_url( '/' );

	return $url;
}

/**
 * Tombol WhatsApp mengambang.
 */
function accupro_wa_float() {
	$wa = function_exists( 'accupro_whatsapp_url' ) ? accupro_whatsapp_url() : '';

	if ( ! $wa ) {
		return;
	}
	?>
	<a class="wa-float" href="<?php echo esc_url( $wa ); ?>" target="_blank" rel="noopener">
		<?php echo accupro_icon( 'whatsapp', 20 ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
		<?php esc_html_e( 'Chat dengan kami', 'accupro' ); ?>
	</a>
	<?php
}

/**
 * Kategori layanan, urut sesuai kolom urutan lalu nama.
 *
 * @return WP_Term[]
 */
function accupro_categories() {
	static $terms = null;

	if ( null !== $terms ) {
		return $terms;
	}

	$terms = get_terms(
		array(
			'taxonomy'   => 'kategori_layanan',
			'hide_empty' => false,
			'meta_key'   => 'accupro_order', // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_key
			'orderby'    => 'meta_value_num',
			'order'      => 'ASC',
		)
	);

	if ( is_wp_error( $terms ) ) {
		$terms = array();
	}

	return $terms;
}

/**
 * Pencari layanan di beranda: pilih bidang, lalu layanan.
 *
 * Nilai option-nya permalink penuh; assets/js/main.js mengarahkan browser ke
 * nilai itu apa adanya kalau sudah absolut.
 */
function accupro_service_finder() {
	$cats = accupro_categories();

	if ( ! $cats ) {
		return;
	}

	$archive = get_post_type_archive_link( 'layanan' );
	?>
	<section class="section section--tight">
		<div class="container">
			<form class="card card--pad finder-bar" id="finder" data-base="" data-all="<?php echo esc_attr( $archive ); ?>" novalidate>
				<div class="finder-bar__grid">
					<div class="finder-bar__label">
						<span class="eyebrow"><?php esc_html_e( 'Pencari layanan', 'accupro' ); ?></span>
						<h3 style="margin-top:4px"><?php esc_html_e( 'Apa yang Anda butuhkan?', 'accupro' ); ?></h3>
					</div>
					<label class="field"><span class="field__label"><?php esc_html_e( '1 — Bidang', 'accupro' ); ?></span>
						<select class="field__select" name="category">
							<option value=""><?php esc_html_e( 'Pilih bidang…', 'accupro' ); ?></option>
							<?php foreach ( $cats as $cat ) : ?>
								<option value="<?php echo esc_attr( $cat->slug ); ?>" data-url="<?php echo esc_url( get_term_link( $cat ) ); ?>"><?php echo esc_html( $cat->name ); ?></option>
							<?php endforeach; ?>
						</select></label>
					<label class="field"><span class="field__label"><?php esc_html_e( '2 — Layanan', 'accupro' ); ?></span>
						<select class="field__select" name="service" disabled>
							<option value=""><?php esc_html_e( 'Semua layanan di bidang ini', 'accupro' ); ?></option>
							<?php foreach ( $cats as $cat ) : ?>
								<?php foreach ( accupro_get_services( $cat->slug ) as $service ) : ?>
									<option value="<?php echo esc_url( get_permalink( $service ) ); ?>" data-cat="<?php echo esc_attr( $cat->slug ); ?>"><?php echo esc_html( get_the_title( $service ) ); ?></option>
								<?php endforeach; ?>
							<?php endforeach; ?>
						</select></label>
					<button class="btn btn--primary" type="submit"><?php esc_html_e( 'Buka layanan', 'accupro' ); ?> <?php echo accupro_icon( 'arrow', 17 ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></button>
				</div>
				<?php if ( $archive ) : ?>
					<p class="tiny" style="margin-top:14px"><?php esc_html_e( 'atau', 'accupro' ); ?> <a href="<?php echo esc_url( $archive ); ?>"><?php esc_html_e( 'lihat seluruh layanan', 'accupro' ); ?></a></p>
				<?php endif; ?>
			</form>
		</div>
	</section>
	<?php
}

/**
 * Ringkasan satu layanan, aman tanpa plugin.
 *
 * @param WP_Post $post Post layanan.
 * @return string
 */
function accupro_summary( $post ) {
	if ( function_exists( 'accupro_service_summary' ) ) {
		return accupro_service_summary( $post );
	}

	return $post->post_excerpt ? $post->post_excerpt : wp_trim_words( wp_strip_all_tags( $post->post_content ), 22 );
}

/*
 * Cadangan kalau plugin Accupro Core tidak aktif.
 *
 * WordPress memuat plugin sebelum tema, jadi kalau plugin aktif definisi
 * aslinya sudah ada lebih dulu dan blok di bawah ini dilewati. Gunanya cuma
 * satu: mencegah fatal error di halaman depan selama plugin belum diaktifkan —
 * peringatannya sendiri sudah muncul di dasbor lewat accupro_require_core_notice().
 */

if ( ! function_exists( 'accupro_get_services' ) ) {
	/**
	 * @param int|string $term  Tidak dipakai.
	 * @param int        $limit Tidak dipakai.
	 * @return array
	 */
	function accupro_get_services( $term = 0, $limit = -1 ) {
		return array();
	}
}

if ( ! function_exists( 'accupro_service_count' ) ) {
	/**
	 * @param WP_Term $term Term.
	 * @return int
	 */
	function accupro_service_count( $term ) {
		return isset( $term->count ) ? (int) $term->count : 0;
	}
}

if ( ! function_exists( 'accupro_tel' ) ) {
	/**
	 * @param string $phone Nomor telepon.
	 * @return string
	 */
	function accupro_tel( $phone ) {
		return preg_replace( '/[^\d+]/', '', (string) $phone );
	}
}

/**
 * ID gambar bawaan Section 1, untuk halaman yang tidak punya gambar sendiri.
 *
 * Diatur di Accupro > Section Beranda > Gambar bawaan halaman.
 *
 * @return int
 */
function accupro_default_banner_id() {
	return (int) accupro_opt( 'banner_image', 0 );
}

/**
 * Lebar minimum sebuah gambar agar layak jadi latar selebar halaman.
 *
 * Gambar kartu boleh kecil — ia tampil beberapa ratus piksel saja. Latar
 * Section 1 membentang selebar viewport, jadi gambar kecil akan meregang dan
 * pecah. Ambang ini yang memisahkan keduanya.
 */
const ACCUPRO_MIN_BANNER_WIDTH = 1200;

/**
 * Apakah lampiran ini cukup besar untuk jadi latar section?
 *
 * @param int $attachment_id ID lampiran.
 * @return bool
 */
function accupro_is_wide_enough( $attachment_id ) {
	if ( ! $attachment_id ) {
		return false;
	}

	$meta = wp_get_attachment_metadata( $attachment_id );

	return ! empty( $meta['width'] ) && (int) $meta['width'] >= ACCUPRO_MIN_BANNER_WIDTH;
}

/**
 * ID gambar Section 1 sebuah post.
 *
 * Gambar utamanya dipakai hanya kalau resolusinya memang memadai; kalau tidak,
 * jatuh ke gambar bawaan. Tanpa pengecekan ini, satu gambar kartu kecil yang
 * kebetulan terpasang akan tampil meregang selebar layar.
 *
 * @param int $post_id Post ID.
 * @return int
 */
function accupro_banner_id( $post_id ) {
	$own = (int) get_post_thumbnail_id( $post_id );

	return accupro_is_wide_enough( $own ) ? $own : accupro_default_banner_id();
}

/**
 * Logo situs.
 *
 * Urutannya: Custom Logo bawaan WordPress, lalu logo dari Accupro > Perusahaan,
 * baru tanda SVG bawaan tema. Situs live memakai berkas logo asli
 * (cropped-accupro.png), jadi tanda SVG itu memang cuma cadangan supaya header
 * tidak pernah kosong — bukan logo yang benar.
 *
 * @param string $class Kelas untuk gambar logo.
 * @return string
 */
function accupro_logo( $class = 'brand__logo' ) {
	$id = (int) accupro_opt( 'logo_image', 0 );

	if ( ! $id && function_exists( 'get_custom_logo' ) ) {
		$id = (int) get_theme_mod( 'custom_logo' );
	}

	if ( $id ) {
		$img = wp_get_attachment_image(
			$id,
			'full',
			false,
			array(
				'class' => $class,
				'alt'   => accupro_opt( 'legal_name', get_bloginfo( 'name' ) ),
			)
		);

		if ( $img ) {
			return $img;
		}
	}

	return accupro_logo_mark();
}

/**
 * Apakah item navigasi ini menunjuk halaman yang sedang dibuka?
 *
 * Dibandingkan lewat path URL, bukan ID, supaya juga benar untuk arsip custom
 * post type dan halaman depan — keduanya tidak punya ID post yang bisa dipakai
 * WordPress untuk menandainya sendiri.
 *
 * @param string $url URL item menu.
 * @return bool
 */
function accupro_nav_is_current( $url ) {
	$item = wp_parse_url( $url, PHP_URL_PATH );
	$here = wp_parse_url( home_url( add_query_arg( array() ) ), PHP_URL_PATH );

	$item = '/' . trim( (string) $item, '/' );
	$here = '/' . trim( (string) $here, '/' );

	if ( '/' === $item ) {
		return '/' === $here;
	}

	// Halaman anak ikut menyalakan induknya: /layanan/<slug>/ menyalakan Layanan.
	return $item === $here || 0 === strpos( $here, $item . '/' );
}
