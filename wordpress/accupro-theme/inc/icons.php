<?php
/**
 * Set ikon SVG.
 *
 * Satu-satunya salinan ikon di seluruh situs — plugin memanggilnya lewat
 * accupro_sc_icon(), yang mengecek function_exists() dulu supaya tetap aman
 * kalau tema lain yang aktif.
 *
 * Ikon di-inline sebagai SVG, bukan font ikon atau file terpisah, supaya tidak
 * ada request tambahan dan warnanya ikut currentColor.
 *
 * @package Accupro
 */

defined( 'ABSPATH' ) || exit;

/**
 * Daftar path SVG per nama ikon.
 *
 * @return array<string,string>
 */
function accupro_icon_paths() {
	return array(
		'chart' => '<path d="M4 20V11M9.5 20V4M15 20v-6M20.5 20V8M2.5 20h19"/>',
		'file' => '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/>',
		'building' => '<rect x="4" y="3" width="16" height="18" rx="1"/><path d="M8 7h2m4 0h2M8 11h2m4 0h2M8 15h2m4 0h2"/>',
		'plane' => '<path d="M3 13.5 21 6l-7.5 15-2.4-6.6z"/>',
		'badge' => '<circle cx="12" cy="9" r="5.5"/><path d="M9 13.8V22l3-2 3 2v-8.2"/>',
		'book' => '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5z"/><path d="M4 5.5v16"/>',
		'clock' => '<circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l3.2 1.9"/>',
		'users' => '<circle cx="9" cy="8" r="3.4"/><path d="M2.5 20c0-3.4 3-5.2 6.5-5.2s6.5 1.8 6.5 5.2"/><path d="M16.5 11a3 3 0 1 0 0-6M21.5 20c0-2.3-.8-3.9-2.2-4.8"/>',
		'check' => '<path d="M20 6.5 9.2 17.3 4 12.1"/>',
		'arrow' => '<path d="M4.5 12h15"/><path d="M13.5 6l6 6-6 6"/>',
		'chevron' => '<path d="M6 9.5l6 6 6-6"/>',
		'search' => '<circle cx="11" cy="11" r="7"/><path d="M20.2 20.2 16 16"/>',
		'pin' => '<path d="M12 21.5s7-6.1 7-11.2a7 7 0 1 0-14 0c0 5.1 7 11.2 7 11.2z"/><circle cx="12" cy="10" r="2.6"/>',
		'phone' => '<path d="M6.5 3h3l1.6 4-2 1.4a11 11 0 0 0 5.5 5.5l1.4-2 4 1.6v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.2 2 2 0 0 1 6.5 3z"/>',
		'mail' => '<rect x="3" y="5" width="18" height="14" rx="1.5"/><path d="m3.5 6.5 8.5 6 8.5-6"/>',
		'whatsapp' => '<path d="M20.5 11.7A8.4 8.4 0 0 1 8 19.4L3.5 20.5l1.2-4.4A8.4 8.4 0 1 1 20.5 11.7z"/><path d="M8.8 9.2c.3 2.4 2.6 4.7 5 5l1-1.4 1.9.8v1.3c-2.6.4-6.9-2.6-7.7-6.5z" fill="currentColor" stroke="none"/>',
		'globe' => '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3c3.2 3.6 3.2 14.4 0 18M12 3c-3.2 3.6-3.2 14.4 0 18"/>',
		'calc' => '<rect x="4.5" y="2.5" width="15" height="19" rx="1.5"/><path d="M8 6.5h8M8 11.5h2m4 0h2M8 16.5h2m4 0h2"/>',
		'screen' => '<rect x="2.5" y="4" width="19" height="12.5" rx="1.5"/><path d="M8.5 20.5h7M12 16.5v4"/>',
		'spark' => '<path d="m12 3 1.9 6.1L20 11l-6.1 1.9L12 19l-1.9-6.1L4 11l6.1-1.9z"/>',
		'scale' => '<path d="M12 3.5v17M7.5 7 3.5 14.5h8zM16.5 7l4 7.5h-8zM6 20.5h12"/>',
		'quote' => '<path d="M9.5 7h-3A2.5 2.5 0 0 0 4 9.5v2A2.5 2.5 0 0 0 6.5 14h2v1.5A2.5 2.5 0 0 1 6 18"/><path d="M19.5 7h-3A2.5 2.5 0 0 0 14 9.5v2a2.5 2.5 0 0 0 2.5 2.5h2v1.5a2.5 2.5 0 0 1-2.5 2.5"/>',
		'image' => '<rect x="3" y="4.5" width="18" height="15" rx="1.5"/><circle cx="8.6" cy="9.8" r="1.5"/><path d="m21 16-5-5-4.2 4.2L9.5 13 3 19.5"/>',
		'doc' => '<path d="M6 2.5h8L18.5 7v14.5H6z"/><path d="M14 2.5V7h4.5M9 12h6M9 16h6"/>',
		'menu' => '<path d="M4 7h16M4 12h16M4 17h16"/>',
		'close' => '<path d="M6 6l12 12M18 6 6 18"/>',
		'ig' => '<rect x="3.5" y="3.5" width="17" height="17" rx="4.5"/><circle cx="12" cy="12" r="3.7"/><circle cx="17" cy="7" r="1" fill="currentColor" stroke="none"/>',
		'fb' => '<path d="M14.5 9.5V7.8c0-.9.5-1.3 1.4-1.3h1.3V3.6h-2.4c-2.5 0-3.6 1.6-3.6 3.9v2h-2v3.2h2v7.7h3.3v-7.7h2.4l.4-3.2z"/>',
		'li' => '<rect x="3.5" y="3.5" width="17" height="17" rx="2"/><path d="M8 10.5v6M8 7.6v.1M12 16.5v-3.4c0-1 .7-1.7 1.7-1.7s1.8.7 1.8 1.7v3.4"/>',
		'tt' => '<path d="M14 3.5v9.9a3.4 3.4 0 1 1-3.4-3.4c.3 0 .6 0 .9.1"/><path d="M14 3.5c.4 2.3 2 3.8 4.3 4v3c-1.7 0-3.2-.5-4.3-1.4"/>',
	);
}

/**
 * Render satu ikon.
 *
 * Nilai kembaliannya sudah aman untuk di-echo tanpa escaping tambahan: isinya
 * markup tetap dari tabel di atas, bukan input pengguna.
 *
 * @param string $name  Nama ikon.
 * @param int    $size  Ukuran piksel.
 * @param string $class Kelas CSS tambahan.
 * @return string
 */
function accupro_icon( $name, $size = 20, $class = '' ) {
	$paths = accupro_icon_paths();

	if ( ! isset( $paths[ $name ] ) ) {
		return '';
	}

	return sprintf(
		'<svg%1$s width="%2$d" height="%2$d" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">%3$s</svg>',
		$class ? ' class="' . esc_attr( $class ) . '"' : '',
		(int) $size,
		$paths[ $name ]
	);
}

/**
 * Logo Accupro.
 *
 * @param string $class Kelas CSS.
 * @return string
 */
function accupro_logo_mark( $class = 'brand__mark' ) {
	return '<svg class="' . esc_attr( $class ) . '" viewBox="0 0 34 32" fill="none" aria-hidden="true">'
		. '<path d="M2 30 17 2l15 28z" fill="#2A3490"/><rect x="9" y="11" width="4.2" height="15" fill="#C09725"/>'
		. '<rect x="15" y="7.5" width="4.2" height="18.5" fill="#C09725"/><rect x="21" y="14" width="4.2" height="12" fill="#C09725"/></svg>';
}
