<?php
/**
 * Halaman pengaturan Accupro — Settings API bawaan WordPress, tanpa ACF.
 *
 * Semua nilai disimpan dalam satu option array 'accupro_settings'. Grup
 * berulang (slide hero, pilar, statistik) memakai jumlah baris tetap dengan
 * baris kosong yang diabaikan saat render — jauh lebih sederhana dan lebih
 * tahan banting daripada repeater berbasis JavaScript, dan sudah cukup untuk
 * desain ini.
 *
 * @package Accupro
 */

defined( 'ABSPATH' ) || exit;

const ACCUPRO_MAX_SLIDES  = 5;
const ACCUPRO_MAX_PILLARS = 6;
const ACCUPRO_MAX_STATS   = 6;

/**
 * Menu admin.
 */
function accupro_admin_menu() {
	add_menu_page(
		__( 'Accupro', 'accupro' ),
		__( 'Accupro', 'accupro' ),
		'manage_options',
		'accupro',
		'accupro_render_company_page',
		'dashicons-building',
		3
	);

	add_submenu_page(
		'accupro',
		__( 'Perusahaan', 'accupro' ),
		__( 'Perusahaan', 'accupro' ),
		'manage_options',
		'accupro',
		'accupro_render_company_page'
	);

	add_submenu_page(
		'accupro',
		__( 'Section Beranda', 'accupro' ),
		__( 'Section Beranda', 'accupro' ),
		'manage_options',
		'accupro-home',
		'accupro_render_home_page'
	);
}
add_action( 'admin_menu', 'accupro_admin_menu' );

/**
 * Daftarkan setting tunggal; seluruh sanitasi terjadi di satu callback.
 */
function accupro_register_settings() {
	register_setting(
		'accupro_settings_group',
		'accupro_settings',
		array(
			'type'              => 'array',
			'sanitize_callback' => 'accupro_sanitize_settings',
			'default'           => array(),
		)
	);
}
add_action( 'admin_init', 'accupro_register_settings' );

/**
 * Definisi field perusahaan.
 *
 * @return array<string,array>
 */
function accupro_company_fields() {
	return array(
		'legal_name'       => array( 'label' => __( 'Nama badan hukum', 'accupro' ), 'type' => 'text' ),
		'short_name'       => array( 'label' => __( 'Nama pendek', 'accupro' ), 'type' => 'text' ),
		'tagline'          => array( 'label' => __( 'Tagline', 'accupro' ), 'type' => 'textarea', 'desc' => __( 'Kalimat pengantar yang dipakai di footer dan halaman Tentang Kami.', 'accupro' ) ),
		'phone_1'          => array( 'label' => __( 'Telepon 1', 'accupro' ), 'type' => 'text' ),
		'phone_2'          => array( 'label' => __( 'Telepon 2', 'accupro' ), 'type' => 'text' ),
		'whatsapp'         => array( 'label' => __( 'WhatsApp', 'accupro' ), 'type' => 'text', 'desc' => __( 'Boleh format 0811… — otomatis diubah ke 62811… untuk tautan wa.me.', 'accupro' ) ),
		'email_1'          => array( 'label' => __( 'Email utama', 'accupro' ), 'type' => 'text' ),
		'email_2'          => array( 'label' => __( 'Email kedua', 'accupro' ), 'type' => 'text' ),
		'address_1'        => array( 'label' => __( 'Alamat baris 1', 'accupro' ), 'type' => 'text' ),
		'address_2'        => array( 'label' => __( 'Alamat baris 2', 'accupro' ), 'type' => 'text' ),
		'city'             => array( 'label' => __( 'Kota & kode pos', 'accupro' ), 'type' => 'text' ),
		'hours'            => array( 'label' => __( 'Jam operasional', 'accupro' ), 'type' => 'text' ),
		'maps_url'         => array( 'label' => __( 'Tautan Google Maps', 'accupro' ), 'type' => 'url' ),
		'social_instagram' => array( 'label' => __( 'Instagram', 'accupro' ), 'type' => 'url' ),
		'social_facebook'  => array( 'label' => __( 'Facebook', 'accupro' ), 'type' => 'url' ),
		'social_linkedin'  => array( 'label' => __( 'LinkedIn', 'accupro' ), 'type' => 'url' ),
		'social_tiktok'    => array( 'label' => __( 'TikTok', 'accupro' ), 'type' => 'url' ),
	);
}

/**
 * Halaman Perusahaan.
 */
function accupro_render_company_page() {
	if ( ! current_user_can( 'manage_options' ) ) {
		return;
	}
	?>
	<div class="wrap">
		<h1><?php esc_html_e( 'Accupro — Perusahaan', 'accupro' ); ?></h1>
		<p><?php esc_html_e( 'Data ini dipakai di header, footer, halaman kontak, dan tombol WhatsApp di seluruh situs. Terjemahan bahasa Inggris & Mandarin diatur lewat TranslatePress, bukan di sini.', 'accupro' ); ?></p>
		<form method="post" action="options.php">
			<?php settings_fields( 'accupro_settings_group' ); ?>
			<table class="form-table" role="presentation"><tbody>
			<?php foreach ( accupro_company_fields() as $key => $field ) : ?>
				<tr>
					<th scope="row"><label for="accupro_<?php echo esc_attr( $key ); ?>"><?php echo esc_html( $field['label'] ); ?></label></th>
					<td>
						<?php accupro_render_field( $key, $field, accupro_get_option( $key, '' ) ); ?>
					</td>
				</tr>
			<?php endforeach; ?>
			</tbody></table>
			<h2><?php esc_html_e( 'Logo', 'accupro' ); ?></h2>
			<table class="form-table" role="presentation"><tbody>
				<tr>
					<th scope="row"><?php esc_html_e( 'Logo situs', 'accupro' ); ?></th>
					<td>
						<?php accupro_media_field( 'accupro_settings[logo_image]', accupro_get_option( 'logo_image', 0 ) ); ?>
						<p class="description"><?php esc_html_e( 'Tampil di header dan footer. Kosongkan untuk memakai logo bawaan tema.', 'accupro' ); ?></p>
					</td>
				</tr>
			</tbody></table>

			<?php submit_button(); ?>
		</form>
	</div>
	<?php
}

/**
 * Halaman Section Beranda.
 */
function accupro_render_home_page() {
	if ( ! current_user_can( 'manage_options' ) ) {
		return;
	}

	$slides  = accupro_get_group( 'hero_slides' );
	$pillars = accupro_get_group( 'pillars' );
	$stats   = accupro_get_group( 'stats' );
	$icons   = accupro_icon_choices();
	?>
	<div class="wrap">
		<h1><?php esc_html_e( 'Accupro — Section Beranda', 'accupro' ); ?></h1>
		<p><?php esc_html_e( 'Baris yang judulnya dikosongkan tidak akan ditampilkan, jadi Anda bisa menambah atau mengurangi slide, pilar, dan statistik tanpa menyentuh kode.', 'accupro' ); ?></p>
		<form method="post" action="options.php">
			<?php settings_fields( 'accupro_settings_group' ); ?>

			<h2><?php esc_html_e( 'Slide hero', 'accupro' ); ?></h2>
			<table class="widefat striped" style="max-width:1000px">
				<thead><tr>
					<th style="width:30%"><?php esc_html_e( 'Judul', 'accupro' ); ?></th>
					<th><?php esc_html_e( 'Teks pendukung', 'accupro' ); ?></th>
					<th style="width:150px"><?php esc_html_e( 'Gambar', 'accupro' ); ?></th>
				</tr></thead>
				<tbody>
				<?php for ( $i = 0; $i < ACCUPRO_MAX_SLIDES; $i++ ) : ?>
					<tr>
						<td><input type="text" class="large-text" name="accupro_settings[hero_slides][<?php echo (int) $i; ?>][headline]" value="<?php echo esc_attr( $slides[ $i ]['headline'] ?? '' ); ?>"></td>
						<td><textarea class="large-text" rows="2" name="accupro_settings[hero_slides][<?php echo (int) $i; ?>][subtext]"><?php echo esc_textarea( $slides[ $i ]['subtext'] ?? '' ); ?></textarea></td>
						<td><?php accupro_media_field( 'accupro_settings[hero_slides][' . $i . '][image]', $slides[ $i ]['image'] ?? 0 ); ?></td>
					</tr>
				<?php endfor; ?>
				</tbody>
			</table>
			<p class="description"><?php esc_html_e( 'Kosongkan gambar bila slide cukup dengan teks saja.', 'accupro' ); ?></p>

			<h2><?php esc_html_e( 'Pilar layanan', 'accupro' ); ?></h2>
			<table class="widefat striped" style="max-width:1000px">
				<thead><tr>
					<th style="width:140px"><?php esc_html_e( 'Ikon', 'accupro' ); ?></th>
					<th style="width:25%"><?php esc_html_e( 'Judul', 'accupro' ); ?></th>
					<th><?php esc_html_e( 'Penjelasan', 'accupro' ); ?></th>
					<th style="width:150px"><?php esc_html_e( 'Gambar', 'accupro' ); ?></th>
				</tr></thead>
				<tbody>
				<?php for ( $i = 0; $i < ACCUPRO_MAX_PILLARS; $i++ ) : ?>
					<?php $current_icon = $pillars[ $i ]['icon'] ?? ''; ?>
					<tr>
						<td>
							<select name="accupro_settings[pillars][<?php echo (int) $i; ?>][icon]">
								<?php foreach ( $icons as $icon_key => $icon_label ) : ?>
									<option value="<?php echo esc_attr( $icon_key ); ?>" <?php selected( $current_icon, $icon_key ); ?>><?php echo esc_html( $icon_label ); ?></option>
								<?php endforeach; ?>
							</select>
						</td>
						<td><input type="text" class="large-text" name="accupro_settings[pillars][<?php echo (int) $i; ?>][title]" value="<?php echo esc_attr( $pillars[ $i ]['title'] ?? '' ); ?>"></td>
						<td><textarea class="large-text" rows="2" name="accupro_settings[pillars][<?php echo (int) $i; ?>][text]"><?php echo esc_textarea( $pillars[ $i ]['text'] ?? '' ); ?></textarea></td>
						<td><?php accupro_media_field( 'accupro_settings[pillars][' . $i . '][image]', $pillars[ $i ]['image'] ?? 0 ); ?></td>
					</tr>
				<?php endfor; ?>
				</tbody>
			</table>

			<h2><?php esc_html_e( 'Statistik', 'accupro' ); ?></h2>
			<table class="widefat striped" style="max-width:800px">
				<thead><tr>
					<th style="width:120px"><?php esc_html_e( 'Angka', 'accupro' ); ?></th>
					<th><?php esc_html_e( 'Keterangan', 'accupro' ); ?></th>
					<th style="width:160px"><?php esc_html_e( 'Tampil di hero?', 'accupro' ); ?></th>
				</tr></thead>
				<tbody>
				<?php for ( $i = 0; $i < ACCUPRO_MAX_STATS; $i++ ) : ?>
					<tr>
						<td><input type="text" class="small-text" name="accupro_settings[stats][<?php echo (int) $i; ?>][value]" value="<?php echo esc_attr( $stats[ $i ]['value'] ?? '' ); ?>"></td>
						<td><input type="text" class="large-text" name="accupro_settings[stats][<?php echo (int) $i; ?>][label]" value="<?php echo esc_attr( $stats[ $i ]['label'] ?? '' ); ?>"></td>
						<td>
							<label>
								<input type="checkbox" value="1" name="accupro_settings[stats][<?php echo (int) $i; ?>][in_hero]" <?php checked( ! empty( $stats[ $i ]['in_hero'] ) ); ?>>
								<?php esc_html_e( 'Ya', 'accupro' ); ?>
							</label>
						</td>
					</tr>
				<?php endfor; ?>
				</tbody>
			</table>
			<p class="description"><?php esc_html_e( 'Statistik yang tidak dicentang tetap tampil di halaman Tentang Kami, hanya tidak di hero beranda.', 'accupro' ); ?></p>

			<h2><?php esc_html_e( 'Ajakan konsultasi (CTA)', 'accupro' ); ?></h2>
			<table class="form-table" role="presentation"><tbody>
				<tr>
					<th scope="row"><label for="accupro_cta_heading"><?php esc_html_e( 'Judul', 'accupro' ); ?></label></th>
					<td><input type="text" class="large-text" id="accupro_cta_heading" name="accupro_settings[cta_heading]" value="<?php echo esc_attr( accupro_get_option( 'cta_heading', '' ) ); ?>"></td>
				</tr>
				<tr>
					<th scope="row"><label for="accupro_cta_text"><?php esc_html_e( 'Penjelasan', 'accupro' ); ?></label></th>
					<td><textarea class="large-text" rows="3" id="accupro_cta_text" name="accupro_settings[cta_text]"><?php echo esc_textarea( accupro_get_option( 'cta_text', '' ) ); ?></textarea></td>
				</tr>
				<tr>
					<th scope="row"><?php esc_html_e( 'Gambar pendamping', 'accupro' ); ?></th>
					<td>
						<?php accupro_media_field( 'accupro_settings[cta_image]', accupro_get_option( 'cta_image', 0 ) ); ?>
						<p class="description"><?php esc_html_e( 'Foto di sebelah ajakan konsultasi, muncul di hampir semua halaman.', 'accupro' ); ?></p>
					</td>
				</tr>
			</tbody></table>

			<h2><?php esc_html_e( 'Gambar bawaan halaman', 'accupro' ); ?></h2>
			<table class="form-table" role="presentation"><tbody>
				<tr>
					<th scope="row"><?php esc_html_e( 'Banner halaman', 'accupro' ); ?></th>
					<td>
						<?php accupro_media_field( 'accupro_settings[banner_image]', accupro_get_option( 'banner_image', 0 ) ); ?>
						<p class="description"><?php esc_html_e( 'Dipakai di bagian atas halaman katalog layanan, alat hitung, dan arsip — yaitu halaman yang tidak punya gambar sendiri.', 'accupro' ); ?></p>
					</td>
				</tr>
			</tbody></table>

			<?php submit_button(); ?>
		</form>
	</div>
	<?php
}

/**
 * Render satu field sederhana pada halaman Perusahaan.
 *
 * @param string $key   Kunci setting.
 * @param array  $field Definisi field.
 * @param mixed  $value Nilai saat ini.
 */
function accupro_render_field( $key, $field, $value ) {
	$name = 'accupro_settings[' . $key . ']';
	$type = isset( $field['type'] ) ? $field['type'] : 'text';

	if ( 'textarea' === $type ) {
		printf(
			'<textarea name="%1$s" id="accupro_%2$s" rows="3" class="large-text">%3$s</textarea>',
			esc_attr( $name ),
			esc_attr( $key ),
			esc_textarea( $value )
		);
	} else {
		printf(
			'<input type="%1$s" name="%2$s" id="accupro_%3$s" value="%4$s" class="regular-text">',
			esc_attr( 'url' === $type ? 'url' : 'text' ),
			esc_attr( $name ),
			esc_attr( $key ),
			esc_attr( $value )
		);
	}

	if ( ! empty( $field['desc'] ) ) {
		echo '<p class="description">' . esc_html( $field['desc'] ) . '</p>';
	}
}

/**
 * Sanitasi seluruh option array.
 *
 * Penting: kedua halaman admin mengirim ke option yang sama, jadi nilai yang
 * tidak ada di form yang sedang disimpan harus dipertahankan — kalau tidak,
 * menyimpan halaman Beranda akan menghapus data Perusahaan.
 *
 * @param mixed $input Input mentah dari form.
 * @return array
 */
function accupro_sanitize_settings( $input ) {
	$existing = get_option( 'accupro_settings', array() );
	$existing = is_array( $existing ) ? $existing : array();
	$input    = is_array( $input ) ? $input : array();
	$out      = $existing;

	foreach ( accupro_company_fields() as $key => $field ) {
		if ( ! array_key_exists( $key, $input ) ) {
			continue;
		}
		$type = isset( $field['type'] ) ? $field['type'] : 'text';
		if ( 'textarea' === $type ) {
			$out[ $key ] = sanitize_textarea_field( $input[ $key ] );
		} elseif ( 'url' === $type ) {
			$out[ $key ] = esc_url_raw( $input[ $key ] );
		} else {
			$out[ $key ] = sanitize_text_field( $input[ $key ] );
		}
	}

	if ( array_key_exists( 'hero_slides', $input ) ) {
		$out['hero_slides'] = accupro_sanitize_rows(
			$input['hero_slides'],
			array(
				'headline' => 'text',
				'subtext'  => 'textarea',
				'image'    => 'int',
			),
			'headline'
		);
	}

	if ( array_key_exists( 'pillars', $input ) ) {
		$out['pillars'] = accupro_sanitize_rows(
			$input['pillars'],
			array(
				'icon'  => 'key',
				'title' => 'text',
				'text'  => 'textarea',
				'image' => 'int',
			),
			'title'
		);
	}

	if ( array_key_exists( 'stats', $input ) ) {
		$out['stats'] = accupro_sanitize_rows(
			$input['stats'],
			array(
				'value'   => 'text',
				'label'   => 'text',
				'in_hero' => 'bool',
			),
			'value'
		);
	}

	foreach ( array( 'cta_heading' => 'text', 'cta_text' => 'textarea' ) as $key => $type ) {
		if ( array_key_exists( $key, $input ) ) {
			$out[ $key ] = 'textarea' === $type
				? sanitize_textarea_field( $input[ $key ] )
				: sanitize_text_field( $input[ $key ] );
		}
	}

	// ID lampiran; absint() membuang nilai negatif dan teks apa pun.
	foreach ( array( 'cta_image', 'banner_image', 'logo_image' ) as $key ) {
		if ( array_key_exists( $key, $input ) ) {
			$out[ $key ] = absint( $input[ $key ] );
		}
	}

	if ( ! empty( $out['logo_image'] ) ) {
		accupro_maybe_set_site_icon( $out['logo_image'] );
	}

	return $out;
}

/**
 * Pakai logo yang baru dipilih sebagai ikon situs (favicon di tab browser),
 * kalau situs ini belum punya ikon sendiri.
 *
 * Situs yang sudah live biasanya sudah mengatur ini sendiri lewat
 * Appearance > Customize — pilihan itu tidak boleh ditimpa diam-diam. Ini
 * hanya mengisi kekosongan pada instalasi baru, supaya tab browser tidak
 * kosong padahal logo sudah ada.
 *
 * @param int $attachment_id ID lampiran logo.
 */
function accupro_maybe_set_site_icon( $attachment_id ) {
	if ( get_option( 'site_icon' ) ) {
		return;
	}

	update_option( 'site_icon', (int) $attachment_id );
}

/**
 * Sanitasi grup baris; baris yang kolom wajibnya kosong dibuang.
 *
 * @param mixed  $rows     Baris mentah.
 * @param array  $schema   Peta kolom => tipe.
 * @param string $required Kolom yang menentukan baris dipakai atau tidak.
 * @return array
 */
function accupro_sanitize_rows( $rows, $schema, $required ) {
	if ( ! is_array( $rows ) ) {
		return array();
	}

	$out = array();

	foreach ( $rows as $row ) {
		if ( ! is_array( $row ) ) {
			continue;
		}

		if ( empty( $row[ $required ] ) || '' === trim( (string) $row[ $required ] ) ) {
			continue;
		}

		$clean = array();
		foreach ( $schema as $col => $type ) {
			$value = isset( $row[ $col ] ) ? $row[ $col ] : '';
			switch ( $type ) {
				case 'textarea':
					$clean[ $col ] = sanitize_textarea_field( $value );
					break;
				case 'int':
					$clean[ $col ] = $value ? absint( $value ) : 0;
					break;
				case 'bool':
					$clean[ $col ] = ! empty( $value ) ? 1 : 0;
					break;
				case 'key':
					$clean[ $col ] = sanitize_key( $value );
					break;
				default:
					$clean[ $col ] = sanitize_text_field( $value );
			}
		}

		$out[] = $clean;
	}

	return $out;
}
