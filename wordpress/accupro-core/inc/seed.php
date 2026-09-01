<?php
/**
 * Isi awal saat plugin diaktifkan.
 *
 * Sumbernya data/site.json yang ikut dibundel — file yang sama yang dipakai
 * generator statis di repo ini, jadi konten yang muncul setelah aktivasi
 * identik dengan situs statis yang sudah disetujui.
 *
 * Seeder ini idempoten: kalau sebuah entri sudah ada (dicocokkan lewat slug
 * atau meta penanda), entri itu dilewati, bukan diduplikasi. Jadi aman kalau
 * plugin dinonaktifkan lalu diaktifkan lagi.
 *
 * Teks yang diisi di sini semuanya bahasa Indonesia — versi Inggris dan
 * Mandarin ditangani TranslatePress, sesuai setup situs ini.
 *
 * @package Accupro
 */

defined( 'ABSPATH' ) || exit;

/**
 * Baca data bundel.
 *
 * @return array
 */
function accupro_seed_data() {
	$file = ACCUPRO_CORE_PATH . 'data/site.json';

	if ( ! file_exists( $file ) ) {
		return array();
	}

	$raw  = file_get_contents( $file ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
	$data = json_decode( $raw, true );

	return is_array( $data ) ? $data : array();
}

/**
 * Jalankan seluruh proses seeding.
 */
function accupro_seed_default_content() {
	$data = accupro_seed_data();

	if ( ! $data ) {
		return;
	}

	accupro_seed_settings( $data );
	accupro_seed_categories( $data );
	accupro_seed_services( $data );
	accupro_seed_testimonials( $data );
	accupro_seed_team( $data );
	accupro_seed_tools( $data );
	accupro_seed_pages();

	update_option( 'accupro_seeded_version', ACCUPRO_CORE_VERSION );
}

/**
 * Pengaturan perusahaan + section beranda.
 *
 * @param array $data Data bundel.
 */
function accupro_seed_settings( $data ) {
	$existing = get_option( 'accupro_settings', array() );

	// Sudah pernah diisi — jangan timpa hasil kerja editor.
	if ( ! empty( $existing ) && is_array( $existing ) ) {
		return;
	}

	$company = isset( $data['company'] ) ? $data['company'] : array();
	$lang    = 'id';

	$pick = static function ( $value ) use ( $lang ) {
		if ( is_array( $value ) ) {
			return isset( $value[ $lang ] ) ? $value[ $lang ] : reset( $value );
		}
		return (string) $value;
	};

	$settings = array(
		'legal_name'       => isset( $company['legalName'] ) ? $company['legalName'] : '',
		'short_name'       => isset( $company['shortName'] ) ? $company['shortName'] : '',
		'tagline'          => isset( $company['tagline'] ) ? $pick( $company['tagline'] ) : '',
		'phone_1'          => isset( $company['phones'][0] ) ? $company['phones'][0] : '',
		'phone_2'          => isset( $company['phones'][1] ) ? $company['phones'][1] : '',
		'whatsapp'         => isset( $company['whatsapp'] ) ? $company['whatsapp'] : '',
		'email_1'          => isset( $company['emails'][0] ) ? $company['emails'][0] : '',
		'email_2'          => isset( $company['emails'][1] ) ? $company['emails'][1] : '',
		'address_1'        => isset( $company['addressLine'] ) ? $company['addressLine'] : '',
		'address_2'        => isset( $company['addressLine2'] ) ? $company['addressLine2'] : '',
		'city'             => isset( $company['city'] ) ? $company['city'] : '',
		'hours'            => isset( $company['hours'] ) ? $pick( $company['hours'] ) : '',
		'social_instagram' => isset( $company['social']['instagram'] ) ? $company['social']['instagram'] : '',
		'social_facebook'  => isset( $company['social']['facebook'] ) ? $company['social']['facebook'] : '',
		'social_linkedin'  => isset( $company['social']['linkedin'] ) ? $company['social']['linkedin'] : '',
		'social_tiktok'    => isset( $company['social']['tiktok'] ) ? $company['social']['tiktok'] : '',
	);

	// Hero.
	$hero_source = array();
	if ( isset( $data['hero'][ $lang ]['slides'] ) ) {
		$hero_source = $data['hero'][ $lang ]['slides'];
	} elseif ( isset( $data['hero']['slides'] ) ) {
		$hero_source = $data['hero']['slides'];
	}

	$settings['hero_slides'] = array();
	foreach ( $hero_source as $slide ) {
		$settings['hero_slides'][] = array(
			'headline' => isset( $slide['headline'] ) ? $slide['headline'] : '',
			'subtext'  => isset( $slide['subtext'] ) ? $slide['subtext'] : ( isset( $slide['text'] ) ? $slide['text'] : '' ),
			'image'    => 0,
		);
	}

	// Pilar.
	$settings['pillars'] = array();
	foreach ( ( isset( $data['pillars'] ) ? $data['pillars'] : array() ) as $pillar ) {
		$settings['pillars'][] = array(
			'icon'  => isset( $pillar['icon'] ) ? $pillar['icon'] : 'chart',
			'title' => isset( $pillar['title'] ) ? $pick( $pillar['title'] ) : '',
			'text'  => isset( $pillar['text'] ) ? $pick( $pillar['text'] ) : '',
			'image' => 0,
		);
	}

	// Statistik.
	$settings['stats'] = array();
	foreach ( ( isset( $data['stats'] ) ? $data['stats'] : array() ) as $stat ) {
		$settings['stats'][] = array(
			'value'   => isset( $stat['value'] ) ? $stat['value'] : '',
			'label'   => isset( $stat['label'] ) ? $pick( $stat['label'] ) : '',
			// 'flag' di data statis menandai angka tanpa satuan yang hanya
			// dipakai di halaman Tentang Kami, bukan di hero.
			'in_hero' => empty( $stat['flag'] ) ? 1 : 0,
		);
	}

	// CTA.
	$cta                     = isset( $data['cta'][ $lang ] ) ? $data['cta'][ $lang ] : ( isset( $data['cta'] ) ? $data['cta'] : array() );
	$settings['cta_heading'] = isset( $cta['heading'] ) ? $cta['heading'] : '';
	$settings['cta_text']    = isset( $cta['text'] ) ? $cta['text'] : '';

	update_option( 'accupro_settings', $settings );
}

/**
 * Kategori layanan.
 *
 * @param array $data Data bundel.
 */
function accupro_seed_categories( $data ) {
	foreach ( ( isset( $data['categories'] ) ? $data['categories'] : array() ) as $index => $cat ) {
		if ( empty( $cat['slug'] ) ) {
			continue;
		}

		$term = term_exists( $cat['slug'], 'kategori_layanan' );

		if ( ! $term ) {
			$term = wp_insert_term(
				isset( $cat['name'] ) ? $cat['name'] : $cat['slug'],
				'kategori_layanan',
				array(
					'slug'        => $cat['slug'],
					'description' => isset( $cat['blurb'] ) ? $cat['blurb'] : '',
				)
			);
		}

		if ( is_wp_error( $term ) ) {
			continue;
		}

		$term_id = is_array( $term ) ? (int) $term['term_id'] : (int) $term;

		update_term_meta( $term_id, 'accupro_icon', isset( $cat['icon'] ) ? $cat['icon'] : 'chart' );
		update_term_meta( $term_id, 'accupro_order', $index );
	}
}

/**
 * Slug layanan di situs yang sedang berjalan.
 *
 * data/site.json memakai slug Inggris karena itu yang dipakai generator statis.
 * Situs WordPress-nya memakai slug Indonesia, dan URL itu sudah punya peringkat
 * pencarian — jadi slug di sinilah yang menentukan, bukan yang di JSON.
 *
 * Tanpa peta ini, seeder mencari 'corporate-tax-processing', tidak menemukannya,
 * lalu membuat layanan BARU di sebelah 'pengurusan-pajak-badan' yang sudah ada:
 * 48 layanan, separuhnya duplikat.
 *
 * @return array<string,string> slug JSON => slug WordPress
 */
function accupro_seed_service_slugs() {
	return array(
		'corporate-tax-processing'        => 'pengurusan-pajak-badan',
		'individual-tax-processing'       => 'pengurusan-pajak-orang-pribadi',
		'corporate-annual-tax-return'     => 'pengurusan-spt-tahunan-badan',
		'individual-annual-tax-return'    => 'pengurusan-spt-tahunan-orang-pribadi',
		'corporate-annual-tax-return-nil' => 'pengurusan-spt-tahunan-badan-nihil',
		'sp2dk-response'                  => 'pembalasan-jawaban-surat-sp2dk',
		'pkp-confirmation'                => 'pengukuhan-pengusaha-kena-pajak-pkp',
		'corporate-npwp'                  => 'pembuatan-npwp-badan',
		'individual-npwp'                 => 'pembuatan-npwp-orang-pribadi',
		'npwp-data-update'                => 'perubahan-data-npwp',
		'efin-registration'               => 'pembuatan-efin',
		'coretax-pma-account'             => 'pembuatan-akun-coretax-pma',
		'coretax-pmdn-account'            => 'pembuatan-akun-coretax-pmdn',
		'coretax-personal-activation'     => 'pengaktifan-akun-coretax-pribadi',
		'company-establishment'           => 'pendirian-pt-cv-yayasan',
		'company-legality'                => 'pembuatan-legalitas-perusahaan',
		'deed-amendment'                  => 'perubahan-akta',
		'virtual-office'                  => 'sewa-virtual-office',
		'work-kitas'                      => 'pembuatan-kitas-kerja',
		'investor-kitas'                  => 'pembuatan-kitas-investor',
		'family-kitas'                    => 'pembuatan-kitas-penyatuan-keluarga',
		'business-visa'                   => 'pembuatan-visa-bisnis',
		'trademark-pma'                   => 'pembuatan-merek-pma-wna',
		'trademark-pmdn'                  => 'pembuatan-merek-pmdn-wni',
	);
}

/**
 * Cari layanan yang sudah ada, lewat slug lalu lewat judul.
 *
 * Judul dipakai sebagai cadangan karena slug bisa saja pernah diubah editor,
 * sementara judulnya identik dengan yang tercatat di data/site.json.
 *
 * @param string $slug Slug WordPress yang diharapkan.
 * @param string $name Judul layanan.
 * @return WP_Post|null
 */
function accupro_find_service( $slug, $name ) {
	$found = get_page_by_path( $slug, OBJECT, 'layanan' );

	if ( $found ) {
		return $found;
	}

	$by_title = get_posts(
		array(
			'post_type'        => 'layanan',
			'posts_per_page'   => 1,
			'post_status'      => 'any',
			'title'            => $name,
			'no_found_rows'    => true,
			'suppress_filters' => false,
		)
	);

	return $by_title ? $by_title[0] : null;
}

/**
 * Layanan.
 *
 * Dua jalur. Kalau layanannya sudah ada — situs yang sedang berjalan sudah
 * punya 24 — entri itu diadopsi: isinya tidak disentuh sama sekali, yang
 * ditambahkan hanya kategori dan briefing foto bila memang belum ada. Kalau
 * belum ada, baru dibuatkan, dengan slug Indonesia.
 *
 * @param array $data Data bundel.
 */
function accupro_seed_services( $data ) {
	$slugs = accupro_seed_service_slugs();

	foreach ( ( isset( $data['services'] ) ? $data['services'] : array() ) as $index => $service ) {
		if ( empty( $service['slug'] ) || empty( $service['name'] ) ) {
			continue;
		}

		$slug     = isset( $slugs[ $service['slug'] ] ) ? $slugs[ $service['slug'] ] : $service['slug'];
		$existing = accupro_find_service( $slug, $service['name'] );

		if ( $existing ) {
			accupro_adopt_service( $existing, $service );
			continue;
		}

		$post_id = wp_insert_post(
			array(
				'post_type'   => 'layanan',
				'post_status' => 'publish',
				'post_title'  => $service['name'],
				'post_name'   => $slug,
				'menu_order'  => $index,
			)
		);

		if ( is_wp_error( $post_id ) || ! $post_id ) {
			continue;
		}

		if ( ! empty( $service['shot'] ) ) {
			update_post_meta( $post_id, 'accupro_shot', $service['shot'] );
		}

		if ( ! empty( $service['cat'] ) ) {
			wp_set_object_terms( $post_id, $service['cat'], 'kategori_layanan' );
		}
	}
}

/**
 * Lengkapi layanan yang sudah ada tanpa menimpa apa pun yang sudah diisi.
 *
 * Judul, isi, dan gambar milik editor — tidak disentuh. Yang ditambahkan hanya
 * kategori (tanpa itu layanan lama tidak muncul di katalog, karena katalog
 * mengelompokkan per kategori) dan briefing foto bila kosong.
 *
 * @param WP_Post $post    Layanan yang sudah ada.
 * @param array   $service Entri dari data bundel.
 */
function accupro_adopt_service( $post, $service ) {
	if ( ! empty( $service['cat'] ) ) {
		$terms = wp_get_object_terms( $post->ID, 'kategori_layanan', array( 'fields' => 'ids' ) );

		if ( ! is_wp_error( $terms ) && ! $terms ) {
			wp_set_object_terms( $post->ID, $service['cat'], 'kategori_layanan' );
		}
	}

	if ( ! empty( $service['shot'] ) && ! get_post_meta( $post->ID, 'accupro_shot', true ) ) {
		update_post_meta( $post->ID, 'accupro_shot', $service['shot'] );
	}
}

/**
 * Cari post berdasarkan judul persis, dalam satu post type.
 *
 * Slug tidak bisa diandalkan untuk testimoni dan tim: situs yang berjalan
 * memakai slug seperti 'ibu-cindy', dan sanitize_title() atas nama yang sama
 * belum tentu menghasilkan slug yang identik. Judulnya yang stabil.
 *
 * @param string $type Post type.
 * @param string $title Judul persis.
 * @return WP_Post|null
 */
function accupro_find_by_title( $type, $title ) {
	$found = get_posts(
		array(
			'post_type'        => $type,
			'posts_per_page'   => 1,
			'post_status'      => 'any',
			'title'            => $title,
			'no_found_rows'    => true,
			'suppress_filters' => false,
		)
	);

	return $found ? $found[0] : null;
}

/**
 * Testimoni.
 *
 * Kalau testimoni dengan nama yang sama sudah ada — situs yang berjalan sudah
 * punya empat — kutipannya tidak disentuh; yang diisi hanya nama perusahaan
 * bila field itu masih kosong.
 *
 * @param array $data Data bundel.
 */
function accupro_seed_testimonials( $data ) {
	$lang = 'id';

	foreach ( ( isset( $data['testimonials'] ) ? $data['testimonials'] : array() ) as $index => $item ) {
		if ( empty( $item['name'] ) ) {
			continue;
		}

		// '[COMPANY NAME]' adalah penanda di data statis untuk nama yang belum
		// dikonfirmasi klien — jangan ikut dipublikasikan.
		$company = ( ! empty( $item['company'] ) && '[COMPANY NAME]' !== $item['company'] ) ? $item['company'] : '';

		$existing = accupro_find_by_title( 'testimonial', $item['name'] );

		if ( $existing ) {
			if ( $company && ! get_post_meta( $existing->ID, 'accupro_perusahaan', true ) ) {
				update_post_meta( $existing->ID, 'accupro_perusahaan', $company );
			}
			continue;
		}

		$quote = isset( $item['quote'] ) ? $item['quote'] : '';
		if ( is_array( $quote ) ) {
			$quote = isset( $quote[ $lang ] ) ? $quote[ $lang ] : reset( $quote );
		}

		$post_id = wp_insert_post(
			array(
				'post_type'    => 'testimonial',
				'post_status'  => 'publish',
				'post_title'   => $item['name'],
				'post_name'    => sanitize_title( $item['name'] ),
				'post_content' => $quote,
				'menu_order'   => $index,
			)
		);

		if ( ! is_wp_error( $post_id ) && $post_id && $company ) {
			update_post_meta( $post_id, 'accupro_perusahaan', $company );
		}
	}
}

/**
 * Anggota tim.
 *
 * Sama seperti testimoni: yang sudah ada diadopsi, jabatannya hanya diisi bila
 * masih kosong.
 *
 * @param array $data Data bundel.
 */
function accupro_seed_team( $data ) {
	foreach ( ( isset( $data['team'] ) ? $data['team'] : array() ) as $index => $member ) {
		if ( empty( $member['name'] ) ) {
			continue;
		}

		$role     = isset( $member['role'] ) ? $member['role'] : '';
		$existing = accupro_find_by_title( 'team', $member['name'] );

		if ( $existing ) {
			if ( $role && ! get_post_meta( $existing->ID, 'accupro_jabatan', true ) ) {
				update_post_meta( $existing->ID, 'accupro_jabatan', $role );
			}
			continue;
		}

		$post_id = wp_insert_post(
			array(
				'post_type'   => 'team',
				'post_status' => 'publish',
				'post_title'  => $member['name'],
				'post_name'   => sanitize_title( $member['name'] ),
				'menu_order'  => $index,
			)
		);

		if ( ! is_wp_error( $post_id ) && $post_id && $role ) {
			update_post_meta( $post_id, 'accupro_jabatan', $role );
		}
	}
}

/**
 * Alat hitung.
 *
 * @param array $data Data bundel.
 */
function accupro_seed_tools( $data ) {
	foreach ( ( isset( $data['tools'] ) ? $data['tools'] : array() ) as $index => $tool ) {
		if ( empty( $tool['slug'] ) || empty( $tool['name'] ) ) {
			continue;
		}

		$existing = get_page_by_path( $tool['slug'], OBJECT, 'alat' );

		if ( $existing ) {
			continue;
		}

		$post_id = wp_insert_post(
			array(
				'post_type'    => 'alat',
				'post_status'  => 'publish',
				'post_title'   => $tool['name'],
				'post_name'    => $tool['slug'],
				'post_excerpt' => isset( $tool['note'] ) ? $tool['note'] : '',
				'menu_order'   => $index,
			)
		);

		if ( is_wp_error( $post_id ) || ! $post_id ) {
			continue;
		}

		update_post_meta( $post_id, 'accupro_tool_slug', $tool['slug'] );
		update_post_meta( $post_id, 'accupro_tool_kind', isset( $tool['kind'] ) ? $tool['kind'] : 'tax' );

		$bridge = accupro_seed_tool_bridges();

		if ( isset( $bridge[ $tool['slug'] ] ) ) {
			update_post_meta( $post_id, 'accupro_result_label', $bridge[ $tool['slug'] ]['label'] );

			// Slug pendamping ditulis dengan slug JSON; terjemahkan dulu ke slug
			// WordPress, kalau tidak pencariannya selalu gagal di situs yang
			// layanannya memakai slug Indonesia.
			$slugs        = accupro_seed_service_slugs();
			$bridge_slug  = $bridge[ $tool['slug'] ]['service'];
			$bridge_slug  = isset( $slugs[ $bridge_slug ] ) ? $slugs[ $bridge_slug ] : $bridge_slug;
			$service      = get_page_by_path( $bridge_slug, OBJECT, 'layanan' );

			if ( $service ) {
				update_post_meta( $post_id, 'accupro_bridge_post', (string) $service->ID );
			}
		}

		if ( ! empty( $tool['config'] ) ) {
			update_post_meta( $post_id, 'accupro_tool_config', wp_json_encode( $tool['config'] ) );
		}
	}
}

/**
 * Label hasil dan layanan pendamping tiap alat hitung.
 *
 * Dipisah dari data/site.json karena ini pasangan alat-ke-layanan, bukan data
 * situs statis — setelah seeding, editor bisa mengubahnya dari layar Alat
 * Hitung tanpa menyentuh file.
 *
 * @return array<string,array{label:string,service:string}>
 */
function accupro_seed_tool_bridges() {
	return array(
		'pph-badan'           => array(
			'label'   => __( 'Pajak terutang', 'accupro' ),
			'service' => 'corporate-tax-processing',
		),
		'pph21-ter'           => array(
			'label'   => __( 'Potongan per bulan', 'accupro' ),
			'service' => 'individual-tax-processing',
		),
		'pph21-masa'          => array(
			'label'   => __( 'Pajak terutang setahun', 'accupro' ),
			'service' => 'individual-annual-tax-return',
		),
		'pph23'               => array(
			'label'   => __( 'Pajak yang dipotong', 'accupro' ),
			'service' => 'corporate-tax-processing',
		),
		'pph4-2'              => array(
			'label'   => __( 'Pajak final terutang', 'accupro' ),
			'service' => 'corporate-tax-processing',
		),
		'company-setup-cost'  => array(
			'label'   => __( 'Estimasi total biaya', 'accupro' ),
			'service' => 'company-establishment',
		),
		'kitas-requirements'  => array(
			'label'   => __( 'Estimasi waktu proses', 'accupro' ),
			'service' => 'work-kitas',
		),
		'trademark-cost'      => array(
			'label'   => __( 'Estimasi total biaya', 'accupro' ),
			'service' => 'trademark-pmdn',
		),
		'monthly-obligations' => array(
			'label'   => __( 'Bulan ini', 'accupro' ),
			'service' => 'corporate-tax-processing',
		),
	);
}

/**
 * Halaman Tentang Kami dan Kontak.
 *
 * Teksnya verbatim dari situs lama (lihat content-recap/pages/id/) — bukan
 * karangan baru — lalu ditambah shortcode Accupro untuk bagian yang datanya
 * memang sudah dikelola di dasbor: tim, layanan, dan blok kontak. Dengan
 * begitu, mengubah nomor telepon di Accupro > Perusahaan langsung ikut berubah
 * di halaman ini juga.
 *
 * Kalau halaman dengan slug yang sama sudah ada, entri itu dilewati.
 */
function accupro_seed_pages() {
	$pages = array(
		'tentang-kami' => array(
			'title'   => __( 'Tentang Kami', 'accupro' ),
			'excerpt' => __( 'Mitra terpercaya dalam solusi Pajak.', 'accupro' ),
			'content' => "<h2>" . __( 'Dapatkan Solusi Bisnis Terbaik Anda Dengan PT. Accurate Pro International', 'accupro' ) . "</h2>\n\n"
				. "<p>" . __( 'Mitra terpercaya dalam solusi Pajak, Hukum, Legalitas dan Layanan Bisnis anda, berkomitmen pada Integritas, Profesionalisme, dan Inovasi untuk mendukung pertumbuhan dan keberlanjutan bisnis anda di tingkat lokal maupun global.', 'accupro' ) . "</p>\n\n"
				. "<h2>" . __( 'Tim Kami', 'accupro' ) . "</h2>\n\n"
				. "[accupro_tim]\n\n"
				. "<h2>" . __( 'Yang Bisa Kamu Dapatkan', 'accupro' ) . "</h2>\n\n"
				. "[accupro_kategori_layanan]\n",
		),
		'kontak'       => array(
			'title'   => __( 'Kontak', 'accupro' ),
			'excerpt' => __( 'Hubungi Kami Jika Ada Yang Bisa Dibantu.', 'accupro' ),
			'content' => "<h2>" . __( 'Temukan Kami Disini', 'accupro' ) . "</h2>\n\n"
				. "[accupro_kontak]\n\n"
				. "<p>" . __( 'Kirim pesan lewat WhatsApp untuk respons paling cepat, atau telepon kantor kami pada jam kerja.', 'accupro' ) . "</p>\n\n"
				. "[accupro_wa]\n",
		),
	);

	foreach ( $pages as $slug => $page ) {
		if ( get_page_by_path( $slug ) ) {
			continue;
		}

		wp_insert_post(
			array(
				'post_type'    => 'page',
				'post_status'  => 'publish',
				'post_title'   => $page['title'],
				'post_name'    => $slug,
				'post_excerpt' => $page['excerpt'],
				'post_content' => $page['content'],
			)
		);
	}
}
