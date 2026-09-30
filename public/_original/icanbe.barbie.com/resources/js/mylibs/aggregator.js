/**
 * @author Noel Tibbles
 */
	
var aggregator = (function($) {
	"use strict";
	var defaults = {},
		loadedPage = null;
	
 	function init(prop) {
		if(!prop.selected) {
			throw "Please set a selected tab.";
		}
		
		$.extend(true, defaults, prop);
	};

	function loadPage(target, page) {
		if(page == loadedPage) return;
		loadedPage = page;
		
		$(target).load(page + " .content", function() {
			if(jQuery().jScrollPane) {
				$('.content-inner').jScrollPane({
					showArrows : true,
					verticalArrowPositions : 'split'
				});
			};
		})
	};
	
	return {
		init: init,
		loadPage: loadPage
	}
}(jQuery));