<?php
/**
 * Gambar.
 *
 * Situs statis memakai foto stok dari CDN sebagai isian sementara. Di
 * WordPress sumbernya Media Library: Featured Image kalau ada, kalau tidak
 * placeholder yang tetap menjaga tinggi baris — jadi tata letak tidak pernah
 * melompat gara-gara satu post belum diberi gambar.
 *
 * @package Accupro
 */

defined( 'ABSPATH' ) || exit;

/**
 * Kotak gambar sebuah post.
 *
 * @param int    $post_id Post ID.
 * @param string $ratio   Rasio CSS, mis. '4 / 3'.
 * @param string $class   Kelas tambahan pada pembungkus.
 * @param array  $args    fill (bool), size (string), eager (bool).
 * @return string
 */
function accupro_media( $post_id, $ratio = '16 / 9', $class = '', $args = array() ) {
	$args = wp_parse_args(
		$args,
		array(
			'fill'  => false,
			'size'  => 'accupro-card',
			'eager' => false,
		)
	);

	$classes = 'imgslot';

	if ( has_post_thumbnail( $post_id ) ) {
		$classes .= ' imgslot--photo';
	}

	if ( $args['fill'] ) {
		$classes .= ' imgslot--fill';
	}

	if ( $class ) {
		$classes .= ' ' . $class;
	}

	$style = $args['fill'] ? '' : ' style="--ratio:' . esc_attr( $ratio ) . '"';

	if ( ! has_post_thumbnail( $post_id ) ) {
		return '<div class="' . esc_attr( $classes ) . '"' . $style . ' role="img" aria-label="'
			. esc_attr( get_the_title( $post_id ) ) . '">'
			. accupro_icon( 'image', 26 )
			. '</div>';
	}

	$img = get_the_post_thumbnail(
		$post_id,
		$args['size'],
		array(
			'loading'       => $args['eager'] ? 'eager' : 'lazy',
			'decoding'      => 'async',
			'fetchpriority' => $args['eager'] ? 'high' : 'auto',
		)
	);

	return '<div class="' . esc_attr( $classes ) . '"' . $style . '>' . $img . '</div>';
}

/**
 * Kotak gambar sebuah term (kategori layanan).
 *
 * @param WP_Term $term  Term.
 * @param string  $ratio Rasio CSS.
 * @param string  $class Kelas tambahan.
 * @return string
 */
function accupro_term_media( $term, $ratio = '4 / 3', $class = '' ) {
	$attachment_id = (int) get_term_meta( $term->term_id, 'accupro_image_id', true );
	$classes       = 'imgslot' . ( $attachment_id ? ' imgslot--photo' : '' ) . ( $class ? ' ' . $class : '' );
	$style         = ' style="--ratio:' . esc_attr( $ratio ) . '"';

	if ( ! $attachment_id ) {
		return '<div class="' . esc_attr( $classes ) . '"' . $style . ' role="img" aria-label="'
			. esc_attr( $term->name ) . '">' . accupro_icon( 'image', 26 ) . '</div>';
	}

	return '<div class="' . esc_attr( $classes ) . '"' . $style . '>'
		. wp_get_attachment_image( $attachment_id, 'accupro-card', false, array( 'loading' => 'lazy' ) )
		. '</div>';
}

/**
 * Gambar dari ID lampiran (dipakai slide hero dan kartu pilar).
 *
 * @param int    $attachment_id ID lampiran; 0 untuk placeholder.
 * @param string $ratio         Rasio CSS.
 * @param array  $args          fill (bool), size, eager, label.
 * @return string
 */
function accupro_attachment_media( $attachment_id, $ratio = '1 / 1', $args = array() ) {
	$args = wp_parse_args(
		$args,
		array(
			'fill'  => false,
			'size'  => 'accupro-hero',
			'eager' => false,
			'label' => '',
			'class' => '',
		)
	);

	$attachment_id = (int) $attachment_id;
	$classes       = 'imgslot' . ( $attachment_id ? ' imgslot--photo' : '' ) . ( $args['fill'] ? ' imgslot--fill' : '' );

	if ( $args['class'] ) {
		$classes .= ' ' . $args['class'];
	}

	$style = $args['fill'] ? '' : ' style="--ratio:' . esc_attr( $ratio ) . '"';

	if ( ! $attachment_id ) {
		return '<div class="' . esc_attr( $classes ) . '"' . $style . ' role="img" aria-label="'
			. esc_attr( $args['label'] ) . '">' . accupro_icon( 'image', 26 ) . '</div>';
	}

	$img = wp_get_attachment_image(
		$attachment_id,
		$args['size'],
		false,
		array(
			'loading'       => $args['eager'] ? 'eager' : 'lazy',
			'decoding'      => 'async',
			'fetchpriority' => $args['eager'] ? 'high' : 'auto',
		)
	);

	return '<div class="' . esc_attr( $classes ) . '"' . $style . '>' . $img . '</div>';
}
