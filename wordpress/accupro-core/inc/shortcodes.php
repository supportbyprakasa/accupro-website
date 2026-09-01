<?php
/**
 * Shortcode.
 *
 * Tema sudah memuat setiap section otomatis di template-nya. Shortcode di sini
 * untuk kasus lain: menaruh daftar layanan, testimoni, atau blok kontak di
 * tengah halaman biasa yang ditulis editor lewat editor WordPress.
 *
 * Markup-nya memakai kelas CSS yang sama dengan tema, jadi hasilnya identik
 * di mana pun ditempel.
 *
 * @package Accupro
 */

defined( 'ABSPATH' ) || exit;

/**
 * Ikon SVG dari tema, kalau temanya aktif.
 *
 * Plugin tidak menyimpan set ikon sendiri supaya tidak ada dua salinan yang
 * bisa berbeda. Kalau tema lain yang aktif, ikon dilewati dan layout tetap
 * jalan tanpa ikon.
 *
 * @param string $name Nama ikon.
 * @param int    $size Ukuran piksel.
 * @return string HTML SVG, atau string kosong.
 */
function accupro_sc_icon( $name, $size = 20 ) {
	return function_exists( 'accupro_icon' ) ? accupro_icon( $name, $size ) : '';
}

/**
 * Gambar sebuah post: Featured Image kalau ada, kalau tidak placeholder.
 *
 * @param int    $post_id Post ID.
 * @param string $ratio   Rasio CSS, mis. '16 / 9'.
 * @param string $class   Kelas tambahan.
 * @return string
 */
function accupro_sc_media( $post_id, $ratio = '16 / 9', $class = '' ) {
	if ( function_exists( 'accupro_media' ) ) {
		return accupro_media( $post_id, $ratio, $class );
	}

	$classes = trim( 'imgslot ' . $class );

	if ( has_post_thumbnail( $post_id ) ) {
		return '<div class="' . esc_attr( $classes . ' imgslot--photo' ) . '" style="--ratio:' . esc_attr( $ratio ) . '">'
			. get_the_post_thumbnail( $post_id, 'large', array( 'loading' => 'lazy' ) )
			. '</div>';
	}

	return '<div class="' . esc_attr( $classes ) . '" style="--ratio:' . esc_attr( $ratio ) . '" role="img" aria-label="'
		. esc_attr( get_the_title( $post_id ) ) . '">' . accupro_sc_icon( 'image', 26 ) . '</div>';
}

/**
 * Ringkasan sebuah layanan: field ringkasan, lalu excerpt, lalu potongan isi.
 *
 * @param WP_Post $post Post layanan.
 * @return string Teks polos.
 */
function accupro_service_summary( $post ) {
	$ringkas = get_post_meta( $post->ID, 'accupro_ringkas', true );

	if ( $ringkas ) {
		return $ringkas;
	}

	if ( $post->post_excerpt ) {
		return $post->post_excerpt;
	}

	return wp_trim_words( wp_strip_all_tags( $post->post_content ), 22 );
}

/**
 * [accupro_layanan kategori="pajak" jumlah="6" tampilan="grid"]
 *
 * @param array $atts Atribut shortcode.
 * @return string
 */
function accupro_sc_layanan( $atts ) {
	$atts = shortcode_atts(
		array(
			'kategori' => '',
			'jumlah'   => -1,
			'tampilan' => 'grid',
		),
		$atts,
		'accupro_layanan'
	);

	$items = accupro_get_services( $atts['kategori'], (int) $atts['jumlah'] );

	if ( ! $items ) {
		return '';
	}

	ob_start();

	if ( 'list' === $atts['tampilan'] ) {
		echo '<div class="stack" style="--s:14px">';
		foreach ( $items as $item ) {
			?>
			<article class="card card--link" style="overflow:hidden">
				<div class="rowcard" style="--thumb:170px">
					<div class="rowcard__media"><?php echo accupro_sc_media( $item->ID, '1 / 1' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></div>
					<div class="rowcard__body">
						<h3><a href="<?php echo esc_url( get_permalink( $item ) ); ?>"><?php echo esc_html( get_the_title( $item ) ); ?></a></h3>
						<p class="small" style="margin-top:6px"><?php echo esc_html( accupro_service_summary( $item ) ); ?></p>
					</div>
					<div class="rowcard__end">
						<a class="btn btn--quiet" href="<?php echo esc_url( get_permalink( $item ) ); ?>">
							<?php esc_html_e( 'Detail', 'accupro' ); ?> <?php echo accupro_sc_icon( 'arrow', 15 ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
						</a>
					</div>
				</div>
			</article>
			<?php
		}
		echo '</div>';

		return ob_get_clean();
	}

	echo '<div class="grid g3">';
	foreach ( $items as $item ) {
		?>
		<a class="card card--link card--pad" href="<?php echo esc_url( get_permalink( $item ) ); ?>">
			<h3><?php echo esc_html( get_the_title( $item ) ); ?></h3>
			<p class="small" style="margin-top:8px"><?php echo esc_html( accupro_service_summary( $item ) ); ?></p>
			<span class="card__more"><?php esc_html_e( 'Lihat detail', 'accupro' ); ?> <?php echo accupro_sc_icon( 'arrow', 16 ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></span>
		</a>
		<?php
	}
	echo '</div>';

	return ob_get_clean();
}
add_shortcode( 'accupro_layanan', 'accupro_sc_layanan' );

/**
 * [accupro_kategori_layanan]
 *
 * @return string
 */
function accupro_sc_kategori() {
	$terms = get_terms(
		array(
			'taxonomy'   => 'kategori_layanan',
			'hide_empty' => false,
			'meta_key'   => 'accupro_order', // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_key
			'orderby'    => 'meta_value_num',
			'order'      => 'ASC',
		)
	);

	if ( is_wp_error( $terms ) || ! $terms ) {
		return '';
	}

	ob_start();
	echo '<div class="grid g3">';

	foreach ( $terms as $term ) {
		$icon  = get_term_meta( $term->term_id, 'accupro_icon', true );
		$count = accupro_service_count( $term );
		?>
		<a class="card card--link" href="<?php echo esc_url( get_term_link( $term ) ); ?>">
			<div class="card__body card__body--badged">
				<span class="card__badge"><?php echo accupro_sc_icon( $icon ? $icon : 'chart', 21 ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></span>
				<div class="between" style="gap:10px">
					<h3><?php echo esc_html( $term->name ); ?></h3>
					<span class="tiny">
						<?php
						printf(
							/* translators: %s: jumlah layanan dalam kategori. */
							esc_html( _n( '%s layanan', '%s layanan', $count, 'accupro' ) ),
							esc_html( number_format_i18n( $count ) )
						);
						?>
					</span>
				</div>
				<?php if ( $term->description ) : ?>
					<p class="small" style="margin-top:8px"><?php echo esc_html( $term->description ); ?></p>
				<?php endif; ?>
				<span class="card__more"><?php esc_html_e( 'Buka kategori', 'accupro' ); ?> <?php echo accupro_sc_icon( 'arrow', 16 ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></span>
			</div>
		</a>
		<?php
	}

	echo '</div>';

	return ob_get_clean();
}
add_shortcode( 'accupro_kategori_layanan', 'accupro_sc_kategori' );

/**
 * [accupro_testimoni jumlah="4"]
 *
 * @param array $atts Atribut shortcode.
 * @return string
 */
function accupro_sc_testimoni( $atts ) {
	$atts = shortcode_atts( array( 'jumlah' => 4 ), $atts, 'accupro_testimoni' );

	$items = get_posts(
		array(
			'post_type'      => 'testimonial',
			'posts_per_page' => (int) $atts['jumlah'],
			'orderby'        => 'menu_order date',
			'order'          => 'ASC',
			'no_found_rows'  => true,
		)
	);

	if ( ! $items ) {
		return '';
	}

	ob_start();
	echo '<div class="grid g4">';

	foreach ( $items as $item ) {
		$company = get_post_meta( $item->ID, 'accupro_perusahaan', true );
		?>
		<figure class="card card--pad">
			<span class="icon-lead"><?php echo accupro_sc_icon( 'quote', 22 ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></span>
			<blockquote style="font-size:.9375rem;line-height:1.6">
				<?php echo wp_kses_post( wpautop( $item->post_content ) ); ?>
			</blockquote>
			<figcaption class="cluster" style="gap:11px;margin-top:16px">
				<span>
					<span style="display:block;font-family:var(--display);font-weight:700;font-size:.875rem;color:var(--ink)"><?php echo esc_html( get_the_title( $item ) ); ?></span>
					<?php if ( $company ) : ?>
						<span class="tiny"><?php echo esc_html( $company ); ?></span>
					<?php endif; ?>
				</span>
			</figcaption>
		</figure>
		<?php
	}

	echo '</div>';

	return ob_get_clean();
}
add_shortcode( 'accupro_testimoni', 'accupro_sc_testimoni' );

/**
 * [accupro_tim]
 *
 * @return string
 */
function accupro_sc_tim() {
	$items = get_posts(
		array(
			'post_type'      => 'team',
			'posts_per_page' => -1,
			'orderby'        => 'menu_order title',
			'order'          => 'ASC',
			'no_found_rows'  => true,
		)
	);

	if ( ! $items ) {
		return '';
	}

	ob_start();
	echo '<div class="grid g4">';

	foreach ( $items as $item ) {
		$role = get_post_meta( $item->ID, 'accupro_jabatan', true );
		?>
		<article class="card">
			<?php echo accupro_sc_media( $item->ID, '3 / 4', 'card__media' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
			<div class="card__body">
				<h3><?php echo esc_html( get_the_title( $item ) ); ?></h3>
				<?php if ( $role ) : ?>
					<p class="tiny" style="margin-top:4px"><?php echo esc_html( $role ); ?></p>
				<?php endif; ?>
			</div>
		</article>
		<?php
	}

	echo '</div>';

	return ob_get_clean();
}
add_shortcode( 'accupro_tim', 'accupro_sc_tim' );

/**
 * [accupro_alat jenis="tax|own|semua"]
 *
 * @param array $atts Atribut shortcode.
 * @return string
 */
function accupro_sc_alat( $atts ) {
	$atts = shortcode_atts( array( 'jenis' => 'semua' ), $atts, 'accupro_alat' );

	$args = array(
		'post_type'      => 'alat',
		'posts_per_page' => -1,
		'orderby'        => 'menu_order title',
		'order'          => 'ASC',
		'no_found_rows'  => true,
	);

	if ( in_array( $atts['jenis'], array( 'tax', 'own' ), true ) ) {
		$args['meta_query'] = array( // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query
			array(
				'key'   => 'accupro_tool_kind',
				'value' => $atts['jenis'],
			),
		);
	}

	$items = get_posts( $args );

	if ( ! $items ) {
		return '';
	}

	ob_start();
	echo '<div class="grid g3">';

	foreach ( $items as $item ) {
		$own = 'own' === get_post_meta( $item->ID, 'accupro_tool_kind', true );
		?>
		<a class="card card--link card--pad<?php echo $own ? ' card--gold' : ''; ?>" href="<?php echo esc_url( get_permalink( $item ) ); ?>">
			<span class="<?php echo $own ? 'icon-lead icon-lead--gold' : 'icon-lead'; ?>"><?php echo accupro_sc_icon( $own ? 'spark' : 'calc', 22 ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></span>
			<h3 style="margin-top:10px"><?php echo esc_html( get_the_title( $item ) ); ?></h3>
			<?php if ( $item->post_excerpt ) : ?>
				<p class="small" style="margin-top:8px"><?php echo esc_html( $item->post_excerpt ); ?></p>
			<?php endif; ?>
			<span class="card__more"><?php esc_html_e( 'Buka alat', 'accupro' ); ?> <?php echo accupro_sc_icon( 'arrow', 16 ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></span>
		</a>
		<?php
	}

	echo '</div>';

	return ob_get_clean();
}
add_shortcode( 'accupro_alat', 'accupro_sc_alat' );

/**
 * [accupro_kontak]
 *
 * @return string
 */
function accupro_sc_kontak() {
	$phones = array_filter( array( accupro_get_option( 'phone_1' ), accupro_get_option( 'phone_2' ) ) );
	$emails = array_filter( array( accupro_get_option( 'email_1' ), accupro_get_option( 'email_2' ) ) );
	$addr   = array_filter( array( accupro_get_option( 'address_1' ), accupro_get_option( 'address_2' ), accupro_get_option( 'city' ) ) );
	$hours  = accupro_get_option( 'hours' );

	ob_start();
	?>
	<div class="grid g3">
		<?php if ( $phones ) : ?>
			<div class="card card--pad">
				<span class="icon-lead"><?php echo accupro_sc_icon( 'phone', 22 ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></span>
				<h3 style="margin-top:10px"><?php esc_html_e( 'Telepon', 'accupro' ); ?></h3>
				<?php foreach ( $phones as $phone ) : ?>
					<p class="small"><a href="tel:<?php echo esc_attr( accupro_tel( $phone ) ); ?>"><?php echo esc_html( $phone ); ?></a></p>
				<?php endforeach; ?>
			</div>
		<?php endif; ?>

		<?php if ( $emails ) : ?>
			<div class="card card--pad">
				<span class="icon-lead"><?php echo accupro_sc_icon( 'mail', 22 ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></span>
				<h3 style="margin-top:10px"><?php esc_html_e( 'Email', 'accupro' ); ?></h3>
				<?php foreach ( $emails as $email ) : ?>
					<p class="small"><a href="mailto:<?php echo esc_attr( $email ); ?>"><?php echo esc_html( $email ); ?></a></p>
				<?php endforeach; ?>
			</div>
		<?php endif; ?>

		<?php if ( $addr ) : ?>
			<div class="card card--pad">
				<span class="icon-lead"><?php echo accupro_sc_icon( 'pin', 22 ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></span>
				<h3 style="margin-top:10px"><?php esc_html_e( 'Kantor', 'accupro' ); ?></h3>
				<p class="small"><?php echo esc_html( implode( ', ', $addr ) ); ?></p>
				<?php if ( $hours ) : ?>
					<p class="tiny" style="margin-top:6px"><?php echo accupro_sc_icon( 'clock', 14 ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?> <?php echo esc_html( $hours ); ?></p>
				<?php endif; ?>
			</div>
		<?php endif; ?>
	</div>
	<?php

	return ob_get_clean();
}
add_shortcode( 'accupro_kontak', 'accupro_sc_kontak' );

/**
 * [accupro_wa teks="Chat WhatsApp"]
 *
 * @param array $atts Atribut shortcode.
 * @return string
 */
function accupro_sc_wa( $atts ) {
	$atts = shortcode_atts(
		array(
			'teks'  => __( 'Chat WhatsApp', 'accupro' ),
			'gaya'  => 'primary',
		),
		$atts,
		'accupro_wa'
	);

	$url = accupro_whatsapp_url();

	if ( ! $url ) {
		return '';
	}

	$class = 'own' === $atts['gaya'] ? 'btn btn--gold' : 'btn btn--' . sanitize_html_class( $atts['gaya'] );

	return sprintf(
		'<a class="%1$s" href="%2$s" target="_blank" rel="noopener">%3$s</a>',
		esc_attr( $class ),
		esc_url( $url ),
		esc_html( $atts['teks'] )
	);
}
add_shortcode( 'accupro_wa', 'accupro_sc_wa' );

/**
 * [accupro_cta]
 *
 * @return string
 */
function accupro_sc_cta() {
	$heading = accupro_get_option( 'cta_heading' );
	$text    = accupro_get_option( 'cta_text' );

	if ( ! $heading && ! $text ) {
		return '';
	}

	$wa = accupro_whatsapp_url();

	ob_start();
	?>
	<div class="card card--navy card--pad">
		<?php if ( $heading ) : ?>
			<h2><?php echo esc_html( $heading ); ?></h2>
		<?php endif; ?>
		<?php if ( $text ) : ?>
			<p class="lede" style="margin-top:10px"><?php echo esc_html( $text ); ?></p>
		<?php endif; ?>
		<?php if ( $wa ) : ?>
			<p style="margin-top:18px">
				<a class="btn btn--onnavy" href="<?php echo esc_url( $wa ); ?>" target="_blank" rel="noopener">
					<?php esc_html_e( 'Chat WhatsApp', 'accupro' ); ?> <?php echo accupro_sc_icon( 'arrow', 16 ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
				</a>
			</p>
		<?php endif; ?>
	</div>
	<?php

	return ob_get_clean();
}
add_shortcode( 'accupro_cta', 'accupro_sc_cta' );
