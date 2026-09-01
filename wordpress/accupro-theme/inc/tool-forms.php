<?php
/**
 * Form input tiap alat hitung.
 *
 * Hanya bagian input yang berbeda per alat — tampilan hasil, riwayat, dan
 * tombol salin sama untuk semua, dan seluruh perhitungan ada di
 * assets/js/calculators.js yang membaca atribut data-tool pada form.
 *
 * PENTING: value setiap option harus persis sama dengan yang dibaca
 * calculators.js. Yang boleh diterjemahkan hanya label yang terlihat.
 *
 * @package Accupro
 */

defined( 'ABSPATH' ) || exit;

/**
 * Field angka rupiah.
 *
 * @param string $label    Label terlihat.
 * @param string $name     Atribut name.
 * @param bool   $required Wajib diisi.
 * @return string
 */
function accupro_field_number( $label, $name, $required = true ) {
	return sprintf(
		'<label class="field"><span class="field__label">%1$s</span><input class="field__input" name="%2$s" type="text" inputmode="numeric" placeholder="Rp"%3$s></label>',
		esc_html( $label ),
		esc_attr( $name ),
		$required ? ' required' : ''
	);
}

/**
 * Field pilihan.
 *
 * @param string   $label   Label terlihat.
 * @param string   $name    Atribut name.
 * @param string[] $options value => label.
 * @return string
 */
function accupro_field_select( $label, $name, $options ) {
	$html = '';

	foreach ( $options as $value => $text ) {
		$html .= sprintf( '<option value="%1$s">%2$s</option>', esc_attr( $value ), esc_html( $text ) );
	}

	return sprintf(
		'<label class="field"><span class="field__label">%1$s</span><select class="field__select" name="%2$s">%3$s</select></label>',
		esc_html( $label ),
		esc_attr( $name ),
		$html
	);
}

/**
 * Susunan form per kode kalkulator.
 *
 * @param string $slug Kode kalkulator.
 * @return string HTML, atau string kosong bila kodenya tidak dikenal.
 */
function accupro_tool_form( $slug ) {
	$forms = array(

		'pph-badan'           => array(
			accupro_field_select(
				__( 'Jenis wajib pajak', 'accupro' ),
				'taxpayerType',
				array(
					'general' => __( 'Badan umum', 'accupro' ),
					'listed'  => __( 'Perusahaan terbuka (Tbk., saham publik ≥40%)', 'accupro' ),
					'msme'    => __( 'UMKM (peredaran bruto ≤ Rp 4,8 M)', 'accupro' ),
				)
			),
			accupro_field_number( __( 'Peredaran bruto setahun', 'accupro' ), 'turnover' ),
			accupro_field_number( __( 'Penghasilan kena pajak (laba fiskal)', 'accupro' ), 'taxableIncome' ),
		),

		'pph21-ter'           => array(
			accupro_field_select( __( 'Status PTKP', 'accupro' ), 'ptkpStatus', accupro_ptkp_options() ),
			accupro_field_number( __( 'Penghasilan bruto per bulan', 'accupro' ), 'grossMonthly' ),
		),

		'pph21-masa'          => array(
			accupro_field_select( __( 'Status PTKP', 'accupro' ), 'ptkpStatus', accupro_ptkp_options() ),
			accupro_field_number( __( 'Penghasilan bruto setahun', 'accupro' ), 'grossAnnual' ),
		),

		'pph23'               => array(
			accupro_field_select(
				__( 'Jenis penghasilan', 'accupro' ),
				'incomeType',
				array(
					'dividend'     => __( 'Dividen', 'accupro' ),
					'interest'     => __( 'Bunga / imbalan penjaminan pinjaman', 'accupro' ),
					'royalty'      => __( 'Royalti', 'accupro' ),
					'prize'        => __( 'Hadiah dan penghargaan', 'accupro' ),
					'rent'         => __( 'Sewa harta (selain tanah/bangunan)', 'accupro' ),
					'service'      => __( 'Jasa teknik, manajemen, atau konsultan', 'accupro' ),
					'otherService' => __( 'Jasa lain (daftar PMK 141/2015)', 'accupro' ),
				)
			),
			accupro_field_number( __( 'Jumlah bruto', 'accupro' ), 'amount' ),
			accupro_field_select(
				__( 'Status NPWP penerima', 'accupro' ),
				'hasNpwp',
				array(
					'yes' => __( 'Ber-NPWP', 'accupro' ),
					'no'  => __( 'Tidak ber-NPWP (tarif dua kali lipat)', 'accupro' ),
				)
			),
		),

		'pph4-2'              => array(
			accupro_field_select(
				__( 'Jenis transaksi', 'accupro' ),
				'transactionType',
				array(
					'rentLandBuilding'                 => __( 'Sewa tanah / bangunan', 'accupro' ),
					'saleLandBuilding'                 => __( 'Pengalihan hak atas tanah atau bangunan', 'accupro' ),
					'saleLandBuildingRSS'              => __( 'Pengalihan — rumah sederhana (RSS/RS)', 'accupro' ),
					'constructionExecutionQualified'   => __( 'Pelaksanaan konstruksi — kontraktor bersertifikat', 'accupro' ),
					'constructionExecutionSmall'       => __( 'Pelaksanaan konstruksi — kualifikasi kecil', 'accupro' ),
					'constructionExecutionUnqualified' => __( 'Pelaksanaan konstruksi — tanpa sertifikat', 'accupro' ),
					'constructionSupervisionQualified' => __( 'Perencanaan/pengawasan konstruksi — bersertifikat', 'accupro' ),
					'constructionSupervisionUnqualified' => __( 'Perencanaan/pengawasan konstruksi — tanpa sertifikat', 'accupro' ),
				)
			),
			accupro_field_number( __( 'Nilai bruto transaksi', 'accupro' ), 'amount' ),
		),

		'company-setup-cost'  => array(
			accupro_field_select(
				__( 'Bentuk badan usaha', 'accupro' ),
				'entityType',
				array(
					'pt'      => __( 'PT (lokal)', 'accupro' ),
					'pma'     => __( 'PT PMA (penanaman modal asing)', 'accupro' ),
					'cv'      => __( 'CV', 'accupro' ),
					'yayasan' => __( 'Yayasan', 'accupro' ),
				)
			),
			accupro_field_number( __( 'Rencana modal disetor', 'accupro' ), 'paidUpCapital' ),
			accupro_field_select(
				__( 'Domisili kantor terdaftar', 'accupro' ),
				'domicile',
				array(
					'jakarta' => __( 'Jakarta', 'accupro' ),
					'other'   => __( 'Kota lain', 'accupro' ),
				)
			),
		),

		'kitas-requirements'  => array(
			accupro_field_select(
				__( 'Jenis KITAS', 'accupro' ),
				'kitasType',
				array(
					'work'     => __( 'KITAS Kerja', 'accupro' ),
					'investor' => __( 'KITAS Investor', 'accupro' ),
					'family'   => __( 'KITAS Penyatuan Keluarga', 'accupro' ),
				)
			),
		),

		'trademark-cost'      => array(
			accupro_field_select(
				__( 'Jenis pemohon', 'accupro' ),
				'applicantType',
				array(
					'local-umkm' => __( 'Lokal — UMKM (tarif lebih rendah)', 'accupro' ),
					'local'      => __( 'Lokal — umum', 'accupro' ),
					'foreign'    => __( 'Pemohon asing', 'accupro' ),
				)
			),
			accupro_field_number( __( 'Jumlah kelas merek', 'accupro' ), 'numClasses', false ),
		),

		'monthly-obligations' => array(
			accupro_field_select(
				__( 'Jenis wajib pajak', 'accupro' ),
				'entityType',
				array(
					'company'    => __( 'Badan', 'accupro' ),
					'individual' => __( 'Orang pribadi', 'accupro' ),
				)
			),
			accupro_field_select(
				__( 'Status PKP', 'accupro' ),
				'pkpStatus',
				array(
					'no'  => __( 'Belum dikukuhkan sebagai PKP', 'accupro' ),
					'yes' => __( 'Sudah dikukuhkan sebagai PKP', 'accupro' ),
				)
			),
		),
	);

	if ( ! isset( $forms[ $slug ] ) ) {
		return '';
	}

	return '<div class="stack" style="--s:14px">' . implode( '', $forms[ $slug ] ) . '</div>';
}

/**
 * Pilihan status PTKP, dipakai dua kalkulator PPh 21.
 *
 * @return string[]
 */
function accupro_ptkp_options() {
	return array(
		'TK/0' => __( 'TK/0 — lajang, tanpa tanggungan', 'accupro' ),
		'TK/1' => 'TK/1',
		'TK/2' => 'TK/2',
		'TK/3' => 'TK/3',
		'K/0'  => __( 'K/0 — menikah, tanpa tanggungan', 'accupro' ),
		'K/1'  => 'K/1',
		'K/2'  => 'K/2',
		'K/3'  => 'K/3',
	);
}
