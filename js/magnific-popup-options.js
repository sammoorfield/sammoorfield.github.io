$(document).ready(function() {
	// CGI
	var magnifPopupCGI = function() {
		$('.image-popup-cgi').magnificPopup({
			type: 'image',
			//titleSrc: 'title',
			removalDelay: 300,
			mainClass: 'mfp-with-zoom',
			closeOnContentClick: true,
			closeOnBgClick: true,
			gallery: {enabled: true, navigateByImgClick: true,},
			fixedBgPos: true,
			fixedContentPos: false,


		image: {
			titleSrc: function(item) {
			var markup = '';
			if (item.el[0].hasAttribute("data-title")) {
			markup += item.el.attr('data-title');
			}
			return markup
			}
		},

		zoom: {
			enabled: true, // By default it's false, so don't forget to enable it

			duration: 300, // duration of the effect, in milliseconds
			easing: 'ease-in-out', // CSS transition easing function

			// The "opener" function should return the element from which popup will be zoomed in
			// and to which popup will be scaled down
			// By defailt it looks for an image tag:
			opener: function(openerElement) {
			// openerElement is the element on which popup was initialized, in this case its <a> tag
			// you don't need to add "opener" option if this code matches your needs, it's defailt one.
			return openerElement.is('img') ? openerElement : openerElement.find('img');
			}
			},

		});
	};
	
	// VFX
	var magnifPopupVFX = function() {
		$('.image-popup-vfx').magnificPopup({
			type: 'image',
			//titleSrc: 'title',
			removalDelay: 300,
			mainClass: 'mfp-with-zoom',
			closeOnContentClick: true,
			closeOnBgClick: true,
			gallery: {enabled: true, navigateByImgClick: true,},
			fixedBgPos: true,
			fixedContentPos: false,


		image: {
			titleSrc: function(item) {
			var markup = '';
			if (item.el[0].hasAttribute("data-title")) {
			markup += item.el.attr('data-title');
			}
			return markup
			}
		},

		zoom: {
			enabled: true, // By default it's false, so don't forget to enable it

			duration: 300, // duration of the effect, in milliseconds
			easing: 'ease-in-out', // CSS transition easing function

			// The "opener" function should return the element from which popup will be zoomed in
			// and to which popup will be scaled down
			// By defailt it looks for an image tag:
			opener: function(openerElement) {
			// openerElement is the element on which popup was initialized, in this case its <a> tag
			// you don't need to add "opener" option if this code matches your needs, it's defailt one.
			return openerElement.is('img') ? openerElement : openerElement.find('img');
			}
			},

		});
	};
	
	// MODELLING
	var magnifPopupMODELLING = function() {
		$('.image-popup-modelling').magnificPopup({
			type: 'image',
			//titleSrc: 'title',
			removalDelay: 300,
			mainClass: 'mfp-with-zoom',
			closeOnContentClick: true,
			closeOnBgClick: true,
			gallery: {enabled: true, navigateByImgClick: true,},
			fixedBgPos: true,
			fixedContentPos: false,


		image: {
			titleSrc: function(item) {
			var markup = '';
			if (item.el[0].hasAttribute("data-title")) {
			markup += item.el.attr('data-title');
			}
			return markup
			}
		},

		zoom: {
			enabled: true, // By default it's false, so don't forget to enable it

			duration: 300, // duration of the effect, in milliseconds
			easing: 'ease-in-out', // CSS transition easing function

			// The "opener" function should return the element from which popup will be zoomed in
			// and to which popup will be scaled down
			// By defailt it looks for an image tag:
			opener: function(openerElement) {
			// openerElement is the element on which popup was initialized, in this case its <a> tag
			// you don't need to add "opener" option if this code matches your needs, it's defailt one.
			return openerElement.is('img') ? openerElement : openerElement.find('img');
			}
			},

		});
	};
  

  
  // Call the functions 
  magnifPopupCGI();
  magnifPopupVFX();
  magnifPopupMODELLING();
});