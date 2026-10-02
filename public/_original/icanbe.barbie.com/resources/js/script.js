/* 
 * Author: Noel Tibbles
 */
var html5video = "", MATTEL = MATTEL || {};

(function($) {
	MATTEL.init = function(node, method, args){
		if($(node).length) {
			method.init.call(MATTEL, args);
		}
	},
	
	MATTEL.global = {
		currentPage : "",
		currentSection : "",
		
		/**
		 * pageLoad
		 * Global initialization of page,section, hovers and nav elements.
		 */
		pageLoad : (function($) {
			/**
			 * init
			 * Gets the hash tag from the url and sets the
			 * currentPage, currentSection and initials the nav.
			 */
			init = function() {
               window.pageInit = true;
                // get the current location

				var hash = window.location.hash.toString();
				MATTEL.global.currentPage = $("body").attr("id") || "home";
				MATTEL.global.currentSection = hash.substring(hash.indexOf("!")+1) || "";
				MATTEL.global.nav.init(MATTEL.global.currentPage);
				
				// set up tracking
				if(typeof track !== 'undefined' && track) MATTEL.modules.analytics.setupPageView(track);
				
				hoverStates();
			};
			
			/**
			 * hoverStates 
			 * Creates a hover state for elements with a background image
			 * in the DOM. This sets the hover on any of these
			 * elements with a .states class
			 */
			hoverStates = function() {
				// check for any states class (which represent layered images in the DOM)
				if($(".states").length){
					// make sure we have a hover class to toggle
					try {
						$(".states").parent().hover(function() {
							$(".states").children(".hover").css("display", "block");
						}, function() {
							$(".states").children(".hover").css("display", "none");
						});
					} catch(e) {
						throw "A .hover class MUST be assigned to a child of .states";
					}
				}
			};
			
			return {
				init:init
			};
			
		}(jQuery)),
		
		nav : (function($){ 
			var animTime = .75,
				fontSize = $("nav a span").css("font-size").replace(/[A-Za-z$]/g, ""),
				index = 0,
				imgPos = {
					top: -10,
					left: -15
				},
				imgContract = {
					width: 160,
					height: 100
				}, 
				imgExpand = {
					width: 200,
					height: 125
				};
			
			/**
			 * init
			 * @param {string} currentPage - the page we're on
			 * initializes all the nav buttons and click handlers for
			 * the header and form buttons.
			 */
			init = function(currentPage) {
               var items = ["games", "videos", "careers"];
				for (var nav in items) {
					if(typeof items[nav] !== "function") {
						var btnId = "#btn-"+items[nav],
							imgSrc = $(btnId).attr("data-img-src"),
							imgShadowSrc = $(btnId).attr("data-img-shadow-src");
							
						this.initButton(btnId, "img_"+items[nav], imgSrc, "shadow_"+items[nav], imgShadowSrc);	
					}
				}	
				
				$("#btn-help").click(handleMouseDown);
				$("#btn-gotACode").click(handleMouseDown);
				$("#btn_survey").click(handleErrorClose);
				$(".btn-close-error").click(handleErrorClose);
				$("#btn_poll").click(handleMouseDown);
				$('body').delegate('#form_code input','keypress', handleKeyPressInCodeInput);
				$("body").delegate("#code_submit", "click", handleCodeSubmit);
				$("body").delegate("input[type=text]", "focus", handleFieldFocus).delegate("input[type=text]", "blur", handleFieldBlur);
                $("body").delegate('#poll_submit', 'click', submitHandler);
			};
			
			/**
			 * initButton
			 * @param {object} targetNode - the DOM object (nav item) to initialize
			 * @param {number} id - the id for the new nav item
			 * @param {string} src - the image source for the button
			 * @param {number} shadowID - the id for the shadow of the image (png)
			 * Hides the current button and replaces it with a new animated button with the
			 * above parameters.
			 * Sets the expanded state of the button if we're on the current page.
			 */
			initButton = function(targetNode, id, src, shadowID, shadowSrc) {
				//console.log("initButton.targetNode: ",targetNode);
				var selected = ("#btn-"+MATTEL.global.currentPage == targetNode),
					t1 = MATTEL.modules.blitter.generateTwinkle($(targetNode), index++), 
					t2 = MATTEL.modules.blitter.generateTwinkle($(targetNode), index++);
				
				// cloud image addition
				var img = new Image();
				img.src = src;
				img.id = id;
				
				// add the shadow image
				var shadow = new Image();
				if(!$.browser.msie) {
					shadow.src = shadowSrc; 
				} else {
					if(!selected) {
						shadow.src = "/_original/icanbe.barbie.com/resources/img/blank.png";
					} else {
						shadow.src = shadowSrc; 
					}
				};
				
				shadow.id = shadowID;
				shadow.className = "hide shadow";
				
				// hide the css background (we have js)
				$(targetNode).css("background", "none").append(img).append(shadow);
				
				// set sizes after adding to the DOM for ie
				img.width = (selected) ? imgExpand.width : imgContract.width;
				img.height = (selected) ? imgExpand.height : imgContract.height;
				
				shadow.width = (selected) ? imgExpand.width : imgContract.width;
				shadow.height = (selected) ? imgExpand.height : imgContract.height;
				
				// add data to referene twinkles
				$(targetNode).data("twinkles", { tw1: t1, tw2: t2 });
				
				// check if this is the selected button
				if(!selected) {
					$(targetNode).mouseenter(this.handleMouseOver).mouseleave(this.handleMouseOut);
				} else {
					// additional changes if selected 
					if(shadow) shadow.style.opacity = 1;
					shadow.className = "shadow";
					$(targetNode+" span").css("font-size", fontSize+"px");
					$(targetNode).css({'width' : imgExpand.width, 'height' : imgExpand.height, 'top' : imgPos.top+"px", 'left' : imgPos.left+"px"});
				}
			};
			
			/**
			 * handleKeyPressInCodeInput
			 * @param {object/event} evt - the mouse event object
			 * Catch-all to capture the "return" press when code input is active
			 */
			handleKeyPressInCodeInput = function(evt){
				if(evt.keyCode==13){
					handleCodeSubmit(evt);
				}
			};
			
			/**
			 * handleMouseOver
			 * @param {object/event} evt - the mouse event object
			 * Animates the over effect on the main nav
			 */
			handleMouseOver = function(evt) {
				var shadow = $(this).children()[4],
					tl = new SimpleTimeline(handleOverComplete);
				
				tl.addTween(new SimpleTween.to($(this)[0], animTime, {
					top : imgPos.top,
					left : imgPos.left
				}, {
					ease : Easing.backEaseOut
				}), 0);

				tl.addTween(new SimpleTween.to($(this).children()[0], animTime, {
					fontSize : Number(fontSize) + (Number(fontSize) * .3)
				}, {
					ease : Easing.backEaseOut
				}), 0);
				
				tl.addTween(new SimpleTween.to($(this).children()[3], animTime, {
					width : imgExpand.width,
					height : imgExpand.height
				}, {
					ease : Easing.backEaseOut
				}), 0);
				
				tl.addTween(new SimpleTween.to(shadow, animTime, {
					width : imgExpand.width,
					height : imgExpand.height,
					opacity : 1
				}, {
					ease : Easing.backEaseOut
				}), 0);
				
				
				tl.start();
			};
			
			/**
			 * handleOverComplete
			 * Animates the sparkles when the nav item has expanded
			 */
			handleOverComplete = function() {
				var tl = new SimpleTimeline();
					twinkles = $(this._curTween.target).parent().data("twinkles"),
					$anchor = $(this._curTween.target).parent();
					
				if($.browser.msie && parseInt($.browser.version, 10) == 7) {
					$anchor.attr('style', 'background: url('+$anchor.attr("data-img-shadow-src")+') no-repeat;');	
				};
				
				// show the holders
				$(twinkles.tw1.holder).css("display", "block");
				$(twinkles.tw2.holder).css("display", "block");
				
				// animate
				tl.addTween(twinkles.tw1.tween, 0);
				tl.addTween(twinkles.tw2.tween, 0.5);
				tl.start();
			};
			
			/**
			 * handleMouseOut
			 * @param {object/event} evt - the mouse event object
			 * Animates all the elements back to their original position
			 */
			handleMouseOut = function(evt) {
				var shadow = $(this).children()[4];

                $anchor = $(evt.target).parent();

				if($.browser.msie && parseInt($.browser.version, 10) == 7) {
					$anchor.attr('style', 'none');	
				};
				
				new SimpleTween.to($(this)[0], animTime, {
					top : 0,
					left : 0
				}, {
					ease : Easing.backEaseOut
				});
				new SimpleTween.to($(this).children()[0], animTime, {
					fontSize : fontSize
				}, {
					ease : Easing.backEaseOut
				});
				new SimpleTween.to($(this).children()[3], animTime, {
					width : imgContract.width,
					height : imgContract.height
				}, {
					ease : Easing.backEaseOut
				});
				new SimpleTween.to(shadow, animTime, {
					width : imgContract.width,
					height : imgContract.height,
					opacity : 0
				}, {
					ease : Easing.backEaseOut
				});
				
			};
			
			/**
			 * handleMouseDown
			 * @param {object/event} evt - the mouse event object
			 * Handles the mouse click and creates an overlay.
			 * Loads the page that's attached to the anchor tag of the target.
			 */
			handleMouseDown = function(evt) {
				evt.preventDefault();
	
				var targetHTML = $(evt.target).attr("href");
				if(evt.target != this) {
					targetHTML = $(evt.target).parent().attr("href");
				}
			
				$('<div/>', {
				    id: 'blocker',
				    href: '#',
				    style: 'display: none'
				}).addClass('blocker').appendTo('body');
				
				$("#blocker").load(targetHTML+" #main", function() {
					$("#blocker").css("display", "block");
					// believe it or not, Chrome won't display the backgrounds twice, so we force it to.
					if(targetHTML.indexOf("code") != -1) {
						$("#got_a_code").attr("style", "background: url('/resources/img/background-got-code.png') no-repeat;");
					}
				});
				
				$("body").delegate(".btn-close", "click", handleWindowClose);
				$("body").delegate("#help .btn-pill", "click", handleWindowClose);
			};
			
			handleWindowClose = function(evt) {
				$("#blocker").remove('#blocker');
				$(window).unbind("scroll");
			};
			
			handleErrorClose = function(evt) {
				$(this).parent().parent().css("display", "none");
			};
			
			handleFieldFocus = function(evt) {
				if(!$(this).attr("data-empty-val") || $(this).val() == $(this).attr("data-empty-val")) {
					var curText = $(this).val();
					$(this).val("");
					$(this).attr("data-empty-val", curText);
				}
			};
			
			handleFieldBlur = function(evt) {
				if($(this).val() == ""){
					$(this).val($(this).attr("data-empty-val") || "");
				}	
			};
			
			handleCodeSubmit = function(evt) {
				evt.preventDefault();
				$.ajax({
            		url: $("#form_code").attr("action"), 
             		type: "POST",       
            		data: { code: $("#code").val() },     
	             	cache: false,
            		success: function (html) {
                        //alert( $("#blocker .pad-17").html() );
            			$("#blocker .pad-17").html($('.code_form', html)); 
            		}
        		});
			}
			
			return {
				init: init,
				initButton: initButton,
				handleMouseOver: handleMouseOver,
				handleMouseOut: handleMouseOut
			}
			
		}(jQuery))
	},
	
	MATTEL.modules = {	
		aggregator : (function($) { 
			var currentTab = "", defaults = {};
			
			init = function(params) {
				defaults = {
					tabs : $(".aggregator .main-nav li span"),
					insertion : $(".aggregator .content"),
					selected : MATTEL.global.currentSection || params.selected
				};
				
				// stop default click
				//$("body").delegate(".aggregator a:not([class=btn-inline],[class=holder blue])", "click", handleAggreClick);
                $("body").delegate(".aggregator a:not(.holder, .btn-inline)", "click", handleAggreClick);
				
				// check if need to initialize the scrollpane
				if(jQuery().jScrollPane) {
					$('.content-inner').jScrollPane({
						showArrows : true,
						verticalArrowPositions : 'split'
					});
				};
				aggregator.init(defaults);

                /*
				if(defaults.selected !== "") {
					var page = $("."+defaults.selected+ " a").attr("href");
					aggregator.loadPage(".content", page);
					defaults.selected = "";
				}
                */
                var selectedTag = $(".aggregator .main-nav").children(".selected");
                var page = (selectedTag.children("a")).attr("href");
                // Restoration adaptation: pages that reuse the #games body id without a
                // tab aggregator (individual game pages) must not fire a bogus AJAX
                // load of the "undefined" URL (the original did).
                if (page) { aggregator.loadPage(".content", page); }
                defaults.selected = ""; 

			}; 
			
			reinitScrollbar = function() {
				MATTEL.jscrollbar_api.reinitialise();
			};
			
			handleAggreClick = function(evt) {
				//console.log("handleAggreClick");
				evt.preventDefault();
				var targetPath = $(this).attr("href"),
					currentTab = $(this).parent().attr("class").split(" ", 1);
					

				// remove the previous selected class and add the new one
				$(".main-nav li").removeClass('selected');
				$(this).parent().addClass('selected');
				
				aggregator.loadPage(".content", targetPath);
				
				// set the hash in the url
				window.location.hash = "!"+currentTab[0];
			};
			
		
			return {
				init:init
			};
		}(jQuery)),
		
		poll : (function($){
			submitHandler = function(evt) {
				console.log("submitHandler");
				evt.preventDefault();
                $.ajax({
                    url: $('#form_poll_2').attr('action'),
                    type: "POST",
                    data: { 
                    	component: $("#component").val(),
                        componentTemplate: $("#componentTemplate").val(),
                        choice: $("#choice").val()
                    },
                    cache: false,
                    success: function (htmlFragment) {
                        $("#poll_area").html(htmlFragment)
                    }
                });
			};
		}(jQuery)),
		
		blitter : (function($){
			generateTwinkleBlit = function(targetNode, id) {
				//console.log("blitter: ",targetNode);
				var blitHolder = document.createElement("div"), 
					blit;
					
				$(targetNode).append(blitHolder);
				blitHolder.id = "sparkle"+id;
				blitHolder.className = "fx";
				blit = SimpleBlitter.create("sparkle"+id, 0.5, { data:"/_original/icanbe.barbie.com/data/blitter/sparkle.json", pause:true });
				
				return {holder: blitHolder, tween: blit};
			};
			
			return {
				generateTwinkle : generateTwinkleBlit
			}
			
		}(jQuery)),
		
		/**
		 * Adds a twinkle/sparkle blit to a button
		 * 
		 */
		buttons : (function($){
			init = function(params){
				var index = 0, me = this;
				
				$.each($(params.holder), function(i, value){
					var blitData1 = MATTEL.modules.blitter.generateTwinkle($(this), "_t"+index++),
						blitData2 = MATTEL.modules.blitter.generateTwinkle($(this), "_t"+index++);
					$(this).bind("mouseenter", { blit1: blitData1, blit2: blitData2 }, me.modules.buttons.handleMouseOver);
					$(".fx:last").removeClass('fx').addClass("fx_last");
				});
			};
			
			handleMouseOver = function(evt) {
				var tl = new SimpleTimeline();
				tl.addTween(evt.data.blit1.tween);
				tl.addTween(evt.data.blit2.tween);
				tl.start();
			};
			
			return {
				init: init,
				handleMouseOver: handleMouseOver
			}
		}(jQuery)),
		
		videos : (function($){
			var curId, useFlash, htmlVid, htmlVidType, attributes, currentVidId, autoPlay, hasFlash = null;
		
			init = function(params) {
				// Restoration adaptation (documented in the project log): the historical
				// video service (mediaservice.mirror-image.com) was never archived, so no
				// player is embedded, no external service is contacted and video
				// thumbnails simply link to the restored video detail pages.
			};
			
			/**
			 * handleDeepLink
			 * loads a video based on link
			 * Set a timeout, due to the delay in flash initialization
			
			handleDeepLink = function(id) {
				var vidId = (id) ? id : MATTEL.global.currentSection;
				console.log("currentSection: ",MATTEL.global.currentSection," vidId: ",id);
				//if(MATTEL.global.currentSection === vidId) return;
				
				
				//if(id == undefined) id = MATTEL.global.currentSection;
				//console.log("deepLinkId: ",vidId);
				loadNewVideo(vidId);
				MATTEL.global.currentSection = vidId;
			};
			 */
			handleVideoClick = function(evt) {
				evt.preventDefault();
				var $id = $(this).attr("data-video-id");
				loadNewVideo($id);
				window.location.hash = "!"+$id;
				
			};
				
			loadNewVideo = function(vidId) {
				//console.log("loadNewVideo: ",vidId);
				if($.browser.msie) document.title = "Barbie.com - I can be...";
				//could change it so we only send id into this js function and the data is looked up, otherwise it is all sent as params
				
				if(curId) {
					$("#assoc-videos a[data-video-id='" + curId +"']").removeClass("pink_selected").addClass("pink");
				}
				$("#assoc-videos a[data-video-id='" + vidId +"']").removeClass("pink").addClass("pink_selected");
				curId = vidId;
				
				
				if(hasFlash){
					if($("#"+attributes.id).length > 0) {

                        var videoTitle = $("#main").find("[data-video-id='"+vidId+"']").attr("data-video-title");

						thisMovie(attributes.id).loadNewVideo({
							//vid_id: vidId, 
                            vid_id: videoTitle,
							vid_path: vidId + "/play.flv",
							poster_path: vidId + "/screenshots/320w239h.jpg" ,
							auto_play: "true"
						});
					} else {
					
					
					setTimeout(function() {
					console.log("set timeout: ",MATTEL.global.currentSection);
						loadNewVideo(MATTEL.global.currentSection) 
					}, 1000);
						
						
					}
					$("#"+attributes.id).focus(normalizeTitle);
				}else{
					var script = getVideoViewer(vidId, {server_detection: true, width:320, height:240, jsonp_variable: "html5video"});
					html5video = "";
					$("#video-player").append(script);
					//console.log("loadHTML5video: ",script);
					loadHTML5Video();
				}
			};
			
			loadHTML5Video = function() {
				console.log("loadHTML5video")
				if (html5video != "") {
			        $("#nonFlashVid").html(html5video);
			    } else {
			       	setTimeout(loadHTML5Video, 1000);
			    };	  
			};
			
			playVideo = function() {
				if(hasFlash){
					thisMovie(attributes.id).playVideo();
				}else{
					htmlVid.play();
					//trackingCall(currentVidId+"_play");
				}
			};
			
			pauseVideo = function() {
				if(hasFlash){
					thisMovie(attributes.id).pauseVideo();
				}else{
					htmlVid.pause();
					//trackingCall(currentVidId+"_pause");
				}
			};
			
			normalizeTitle = function() {
				console.log("normalizeTitle");
				if($.browser.msie) document.title = "Barbie.com - I can be...";
			};
			
			thisMovie = function(movieName) {
		        if (navigator.appName.indexOf("Microsoft") != -1) {
		            return window[movieName];
		        } else {
		            return document[movieName];
		        }
		    };
		    
            //Video flash player will trigger this call, and pass in "id" object
            //actionvar will be either "Play" or "Completed", sent from Flash
		    trackingCall = function(vidName, actionvar) {
                var tObj = {
					name:"I Can Be: "+vidName,
					//campaign:id+"campaign",
					//channel:id+"channel",
					contenttype:"Video",
					action:actionvar
				};
                if( actionvar == "Play" ) {
					setTimeout(function() {
						MATTEL.tracker.Tracker.track(tObj); 
					}, 3000);
				}
				else {
					MATTEL.tracker.Tracker.track(tObj);
				}
		    };

			
			return {
				init: init,
				loadVideo: loadNewVideo,
				playVideo: playVideo,
				pauseVideo: pauseVideo,
				//handleDeepLink: handleDeepLink,
				html5video : html5video
			}
		}(jQuery)),
		
		/**
		 * parallax
		 * Used to create the parallax effect on the homepage
		 * for different promos.
		 * It calculates the start position (left) by taking
		 * the attr 'data-zindex' in the DOM and animates it to 0. Each
		 * level is in a 'slide' container.
		 * @requires SimpleAnimation (https://github.com/ntibbles/SimpleAnimation)
		 */
		parallax: (function($) {
				var d = 445,
					time = 3,
					zo = 2001,
					index = -1,
					$nodes = null,
					slideWidth = 990,
					divOffset = $(".parallax").offset(),
					divCenter = $(".parallax").width()/2,
					startSlide = 0,
					timeline = null;
				
				/**
				 * init
				 * @param {object} params - passed in from global init
				 * Initializes all the slides and controls
				 */
				init = function(params) {
					$nodes = params.nodes;
					startSlide = Math.ceil($nodes.length/2);
					$("#promo_controls .left").click(prev).css("visibility", "hidden");
					$("#promo_controls .right").click(next).css("visibility", "hidden");
					// fixes an issue in IE when it doesn't slide on first visit?!
					setTimeout(function() {
						initHolders();
						setButtons();
						
						for(var i = 0; i < startSlide; i++) {
							next();
						}
					}, 10); //was 4000; trying 10 to see if it fixes the chrome problem w/setTimeout but still works for IE
					
				};
				
				/**
				 * initHolders
				 * Loops through each holder and sets it's
				 * left position
				 */
				initHolders = function() {
					$.each($nodes, function(index, value){
						$.each($(this).children(), function(i, o){
							var dist = $(this).attr("data-zindex") || 0;

							if($(this).hasClass("alpha")){
								$(this).css("opacity", 0);
								return;
							};
							
							$(this).css("left", calcDist(dist));
						});
					});
				};
				
				/**
				 * slide
				 * @param {number} pos - the positon to slide to
				 * @param {boolean} isForward - true to move forward, false for backward
				 * Slides all the elements into place. Looks for the 'alpha' class on an
				 * element and animates opacity if it exists
				 */
				slide = function(pos, isForward) {
					var current = "#promo"+index,
						leaving = (isForward) ? "#promo"+(index-1) : "#promo"+(index+1),
						
						timeline = new SimpleTimeline();
	
						// tween the container
						timeline.addTween(SimpleTween.to($("#slides")[0], time, { left:pos }, {ease: Easing.strongEaseOut }), 0);
						// tween the current target 
						$.each($(current).children(), function(i, o){
							if($(this).hasClass('alpha')){
								timeline.addTween(SimpleTween.to($(this)[0], time, {opacity:1}, {ease:Easing.strongEaseOut}), 2);
								return;
							};
						timeline.addTween(SimpleTween.to($(this)[0], time, {left:0}, {ease:Easing.strongEaseOut}), 0);
					});
					
					try {
						
						$.each($(leaving).children(), function(i, o){
							
							// don't move alpha items
							if($(this).hasClass('alpha')){
								timeline.addTween(SimpleTween.to($(this)[0], time, {opacity:0}, {ease:Easing.strongEaseOut}), 2);
								return;
							};
							
							// calculate the distance for the other items
							var dist = $(this).attr("data-zindex") || 0, newPos = 0;
							if(isForward) {
								newPos = calcDist(-dist);
							} else {
								newPos = calcDist(dist);
							}
							
							timeline.addTween(SimpleTween.to($(this)[0], time, {left:newPos}, {ease:Easing.strongEaseOut}), 0);
						});
					} catch(e) { }
					
					timeline.start();
				};
				
				setButtons = function() {
					if($nodes.length == 1) return;
					
					if(index > 0 && index < $nodes.length - 1) {
						$("#promo_controls .right").css("visibility", "visible");
						$("#promo_controls .left").css("visibility", "visible");
					};
					
					if(index == 0) {
						$("#promo_controls .left").css("visibility", "hidden");
						$("#promo_controls .right").css("visibility", "visible");
					};
					
					if(index == $nodes.length - 1) {
						$("#promo_controls .right").css("visibility", "hidden");
						$("#promo_controls .left").css("visibility", "visible");
					};
				};
				
				/**
				 * next
				 * Moves the to the next slide
				 */
				next = function() {
					if(index > $nodes.length - 2) {
						return;
					} 
				
					index++;
					slide(-index*slideWidth, true);
					setButtons();
				};
				
				/**
				 * prev
				 * Moves to the prev slide
				 */
				
				prev = function() {
					if(index == 0) {
						return;
					}
					
					--index;
					slide(-index*slideWidth, false);
					setButtons();
				};
				
				// NOT USED YET: Adds subtle movement when the mouse is moved
				handleMove = function() {
					$(".parallax").mousemove(function(evt) {
						$.each($(nodes), function(index, value){
							if(index == 3) return;
							var newX = (evt.pageX - divOffset.left) - divCenter;
							$(this).css("left", -((newX * index)/60));
							//SimpleTween.to($(this)[0], .55, { left: -((newX * index)/30)}, {ease: Easing.regularEaseOut});
						})
					});
				};
				
				/**
				 * calcDist
				 * Calculates the distance left
				 */
				calcDist = function(z) {
					// in ie7 this returns infinity
					return Math.floor(d/(1+(z/zo)));
				};
				
			return {
				init: init
			}
		}(jQuery)),
		
		/**
		 * promos
		 * Create's a 3d carousel of images.
		 * @requires SimpleAnimation (https://github.com/ntibbles/SimpleAnimation)
		 */
		
		promos: (function($){
			var tiles = null,
				divOffset = {};
				radiusX = 200,
				radiusY = .5,
				centerX = 250,
				centerY = 5,
				speed = .001,
				scale = 300;
				
			init = function(params) {
				divOffset = $(".holder").offset();
				tiles = params.tiles;
				
				$.each(params.tiles, function(index, obj) {
					var $obj = $(obj),
						data = {
							angle: index * ((Math.PI*2)/params.tiles.length)
						}
					$obj.data("defaults", data); // arbitrary data needed later
					$obj.mouseover(handleMouseOver);
				});
				
				$(".promo").mousemove(handleMouseMove).mouseleave(handleMouseLeave);
				SimpleSynchro.addListener(this.modules.promos);
			};
			
			tick = function() {
				$.each(tiles, function(index, obj) {
					var $obj = $(obj),
						$data = $obj.data("defaults");
					$obj.css("left", Math.cos($data.angle) * radiusX + centerX).css("top", Math.sin($data.angle) * radiusY + centerY);
					var s = Math.sin($data.angle) * radiusY + centerY /(centerY+radiusY);
					$obj.css("height", s*scale).css("z-index", Math.round(s*scale)+1);
					$obj.data("defaults").angle += speed;
				});
			};
			
			handleMouseMove = function(evt) {
				speed = ((evt.pageX - divOffset.left) - centerX)/30000;
			};
			
			handleMouseLeave = function(evt) {
				speed = 0;
				$(".btn-med").removeClass('hover');
			};
			
			handleMouseOver = function(evt) {
				$(".promo .title").html($(evt.target).attr("alt"));
				$(".btn-med").addClass('hover');
			};
			
			return {
				init: init,
				tick: tick
			};

        }(jQuery)),
        
         analytics: (function($){
				
			setupPageView = function(id) {
				console.log("setupPageView: ", MATTEL.tracker);
				// Set up the MATTEL tracker, tracker javascript is added in mattel_utilities module
				MATTEL.tracker.Tracker.name = (id.name) ? id.name : document.title;
				MATTEL.tracker.Tracker.contenttype = (id.contenttype) ? id.contenttype : MATTEL.tracker.CONTENTTYPE.LANDINGPAGE;
				MATTEL.tracker.Tracker.campaign = (id.campaign) ? id.campaign : MATTEL.tracker.CAMPAIGN.NONE;
				MATTEL.tracker.Tracker.channel = (id.channel) ? id.channel : MATTEL.tracker.CHANNEL.NONE;
				MATTEL.tracker.Tracker.action = (id.action) ? id.action : MATTEL.tracker.ACTION.NONE;
                //MATTEL.tracker.Tracker.track();
			};
			setCookie = function(c_name, value, exdays) {
				value = value.substring(1, value.indexOf("/", 1));
                value = value.toLowerCase();
				var exdate = new Date();
				exdate.setDate(exdate.getDate() + exdays);
				var c_value = escape(value) + ((exdays == null) ? "" : "; expires=" + exdate.toUTCString()) + "; path=/";
				document.cookie = c_name + "=" + c_value;
			};
			getCookie = function(c_name) {
				var i, x, y, ARRcookies = document.cookie.split(";");
				for( i = 0; i < ARRcookies.length; i++) {
					x = ARRcookies[i].substr(0, ARRcookies[i].indexOf("="));
					y = ARRcookies[i].substr(ARRcookies[i].indexOf("=") + 1);
					x = x.replace(/^\s+|\s+$/g, "");
					if(x == c_name) {
						return unescape(y);
					}
				}
			};
			AddClickTracking = function(trackname, contenttype, campaign, channel, action) {
				if((trackname != "None") || (contenttype != "None") || (campaign != "None") || (channel != "None") || (action != "None")) {
					var clickObj = {
						name : trackname,
						campaign : campaign,
						channel : channel,
						contenttype : contenttype,
						action : action
					};
					MATTEL.tracker.Tracker.track(clickObj);
				}
			};
			initatePopUp = function(obj, text) {
				window.open(obj.href, '_blank', 'status=1,height=450,width=450,resize=0,scrollbars=yes');
				return false;
			};
			initateExternalLink = function(obj, text) {
				link = 'http://www.barbie.com/includes/partner-interstitial.aspx?redirect=' + obj.href;
				window.open(link, '_blank', 'status=1,height=350,width=650,resize=0,scrollbars=yes');
				return false;
			};
            initateExternalLinkWithILink = function(obj, text, url) {
				link = url + obj.href;
				window.open(link, '_blank', 'status=1,height=350,width=650,resize=0,scrollbars=yes');
				return false;
			};
			return {
				setupPageView : setupPageView,
				setCookie : setCookie,
				getCookie : getCookie,
				AddClickTracking : AddClickTracking,
				initatePopUp : initatePopUp,
				initateExternalLink : initateExternalLink,
                initateExternalLinkWithILink : initateExternalLinkWithILink
			};
		}(jQuery))
	};
}(jQuery));

// prevent errors when tracker is not defined.

if(!window.MATTEL.tracker) {
	window.MATTEL.tracker = {
		CHANNEL :{
			NONE :"none"
		},
		
		CAMPAIGN: {
			NONE: "none"
		},
		
		ACTION: {
			VIEW: "none"
		},

        CONTENTTYPE: {
			LANDING: "LandingPage"
		},
		
		Tracker : {
			name: "",
			contenttype: "",
			campaign: "",
			channel: "",
			action: ""
		}
	};
};

if ($("#games").length && $.browser.msie) {
   
    setTimeout(function () {
		$("#content object").focus(function () {
			$("html").css("overflow", "hidden");
		});
			
		$("#content object").blur(function () {
			$("html").css("overflow", "auto");
		});
		
    	/*
        if ($.browser.msie) {
            var pos = 0, interval = 0, height = 0;

            $("#content object").focus(function () {
               
                pos = $(window).scrollTop();
                height = $(document).height();
                $(window).scrollTop(0);

                $("body").css("height", $(window).height()).css("overflow", "hidden");
                $("#container").css("position", "relative").css("top", -pos).css("height", $(window).height() + (pos * .75)).css("overflow", "hidden");
               // $("#container").css("position", "relative").css("top", -pos).css("height", $(window).height()).css("overflow", "hidden");
                $("#mdn-hd").css("position", "relative").css("top", -pos);
            });

            $("#content object").blur(function () {
               
                $("body").css("height", height);
                $("#container").css("position", "static").css("height", height).css("overflow", "visible");
                $("#mdn-hd").css("position", "static");
                $(window).scrollTop(pos);
            });
        }
        */
    }, 2000);
	
};

if(typeof window.pageInit == 'undefined') {
	MATTEL.global.pageLoad.init();
	MATTEL.init("#main", MATTEL.modules.buttons, { holder: ".twinkle" }); // add the class 'twinkle' to any button to add sparkles
	MATTEL.init("#home", MATTEL.modules.parallax, { nodes: $(".promo_holder") });
	MATTEL.init("#home", MATTEL.modules.promos, { tiles: $(".holder").children() });
	MATTEL.init("#careers", MATTEL.modules.aggregator, { selected: "tab0", data_path:"/data/careers.json", primary_img: $("img.primary").attr("src"), callback:reinitScrollbar});
	MATTEL.init("#games", MATTEL.modules.aggregator, { selected: "tab0", data_path:"/data/games.json" });
	MATTEL.init("#videos", MATTEL.modules.videos, { container: "#assoc-videos", thumbs: "#assoc-videos .holder" });
}
//-------Coremetrics Video Tracking code --------

var COREMETRICS_EVENT_LAUNCH ="Launch";
var COREMETRICS_EVENT_LAUNCH_ID = 0;

var COREMETRICS_EVENT_PAUSE ="Pause";
var COREMETRICS_EVENT_PAUSE_ID =1;

var COREMETRICS_EVENT_PLAY ="Play";
var COREMETRICS_EVENT_PLAY_ID =2;

var COREMETRICS_EVENT_COMPLETION ="Completion";
var COREMETRICS_EVENT_COMPLETION_ID =3;	

var COREMETRICS_EVENT_REPLAY ="Replay";
var COREMETRICS_EVENT_REPLAY_ID =4;

function videoTrackingCode(obj)
{
		var o ={};
	    o.referring_url_attr12 = refferrerUrl;
        o.requested_url_attr13 = requestedUrl;
		o.event_id = obj.vTitle;
		o.event_category_id="video";
		o.event_action_type = "";
		o.event_action_attr46 = "";
		o.event_detail_attr47 = "";
		o.event_detail_sub_attr48 =obj.vId;
		o.event_length_attr49 = obj.pause_time;
		o.event_length_full_attr50 = obj.video_duration;

	if(obj.eventName == COREMETRICS_EVENT_LAUNCH)
	{		
		o.event_action_type = COREMETRICS_EVENT_LAUNCH;
		o.event_action_attr46 = COREMETRICS_EVENT_LAUNCH_ID;
	}else if(obj.eventName == COREMETRICS_EVENT_PLAY)
	{		
		o.event_action_type = COREMETRICS_EVENT_PLAY;
	    o.event_action_attr46 = COREMETRICS_EVENT_PLAY_ID;
	}else if(obj.eventName == COREMETRICS_EVENT_PAUSE)
	{			
		o.event_action_type = COREMETRICS_EVENT_PAUSE;
	    o.event_action_attr46 = COREMETRICS_EVENT_PAUSE_ID;
	}else if(obj.eventName == COREMETRICS_EVENT_COMPLETION)
	{	
	   o.event_action_type = COREMETRICS_EVENT_COMPLETION;
	   o.event_action_attr46 = COREMETRICS_EVENT_COMPLETION_ID;
	}
	else if (obj.eventName == COREMETRICS_EVENT_REPLAY)
	{		
	   o.event_action_type = COREMETRICS_EVENT_REPLAY;
	   o.event_action_attr46 = COREMETRICS_EVENT_REPLAY_ID;
	}
	utag.view(o);
	//showData(o)
	
}

function showData(e) {
	
	/*alert("eventID : "+e.event_id+
    "\n event_category_id : "+ e.event_category_id+
    "\n event_action_type : "+ e.event_action_type+
    "\n event_action_attr46 : "+ e.event_action_attr46+
    "\n event_detail_attr47 : "+ e.event_detail_attr47+
    "\n event_Detail_Sub_attr48 : "+e.event_detail_sub_attr48+
    "\n event_Length_attr49 : "+e.event_length_attr49+
    "\n event_Length_Full_attr50 : "+e.event_length_full_attr50+
	"\n referring_url_attr12 : "+ e.referring_url_attr12+
	"\n requested_url_attr13 : "+e.requested_url_attr13);*/
}

//-------Coremetrics Video Tracking code ends --------