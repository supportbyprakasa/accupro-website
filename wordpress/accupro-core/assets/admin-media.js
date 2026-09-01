/* Accupro — pemilih gambar di admin.
   Menghubungkan tombol pada .accupro-media ke Media Library bawaan WordPress.
   Nilai yang disimpan tetap ID lampiran di input angka, jadi kalau file ini
   gagal dimuat field-nya masih bisa diisi manual. */
(function ($) {
	'use strict';

	function preview($box, attachment) {
		var $preview = $box.find('.accupro-media__preview');
		var url = '';

		if (attachment) {
			var sizes = attachment.sizes || {};
			url = (sizes.thumbnail && sizes.thumbnail.url) || attachment.url || '';
		}

		$preview.html(url ? $('<img>', { src: url, alt: '', css: { display: 'block', maxWidth: '80px', height: 'auto', borderRadius: '4px' } }) : '');
	}

	$(document).on('click', '.accupro-media__pick', function (e) {
		e.preventDefault();

		var $box = $(this).closest('.accupro-media');
		var $id = $box.find('.accupro-media__id');

		var frame = wp.media({
			title: accuproMedia.title,
			button: { text: accuproMedia.button },
			library: { type: 'image' },
			multiple: false
		});

		frame.on('select', function () {
			var attachment = frame.state().get('selection').first().toJSON();
			$id.val(attachment.id);
			preview($box, attachment);
			$box.find('.accupro-media__clear').show();
		});

		frame.open();
	});

	$(document).on('click', '.accupro-media__clear', function (e) {
		e.preventDefault();

		var $box = $(this).closest('.accupro-media');
		$box.find('.accupro-media__id').val('');
		preview($box, null);
		$(this).hide();
	});
})(jQuery);
