$(document).ready(function() {
  // MagnificPopup
  var magnifPopup = function() {
    $('.image-popup').magnificPopup({
      type: 'image',
	  titleSrc: 'title',
      removalDelay: 300,
      mainClass: 'mfp-with-zoom',
	  closeOnContentClick: true,
	  closeOnBgClick: true,
      gallery: {enabled: true, navigateByImgClick: true,},
	  fixedBgPos: false,
	  

	  

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
      }
    });
  };
  
  var snippetsPopup = function() {
    $('.snippets-popup').magnificPopup({
      type: 'inline',
	  titleSrc: 'title',
      removalDelay: 0,
      mainClass: 'mfp-with-zoom',
	  closeOnContentClick: true,
	  closeOnBgClick: true,

	  fixedBgPos: false,

    });
  };
  
  
  var showreelPopup = function() {
    $('.popup-youtube').magnificPopup({
        disableOn: 700,
        type: 'iframe',
        mainClass: 'mfp-fade',
        removalDelay: 160,
        preloader: false,

        fixedContentPos: false,
		
		iframe: {
        patterns: {
            youtube: {
                index: 'youtube.com/', 
                id: function(url) {        
                    var m = url.match(/[\\?\\&]v=([^\\?\\&]+)/);
                    if ( !m || !m[1] ) return null;
                    return m[1];
                },
                src: '//www.youtube.com/embed/%id%?autoplay=1'
            },
        }
		}
		
		
		
		
    });
};
  
  
  
  
  

  
  // Call the functions 
  showreelPopup();
  magnifPopup();
  snippetsPopup();

});