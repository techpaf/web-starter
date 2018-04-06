/*
 * CLASS LightSlider
 *
 * Côme Gaillard, tous droits réservés @ 2018
 *
 * Slider simple avec gestion du responsive
 */
function LightSlider(opts) {
	// VERIF IF JQUERY EXIST
	if(!window.$ || window.$ == undefined) {
		console.warn("[LightSlider] - jQuery is required.");
		console.warn("Install jQuery by npm install");
		return;
	}

	this.defaultOpts = {
		container: $(".slider"), // slider container
		navContainer: $('.slider--nav'), // container for navigation
		imgContainer: $('.slider--img'), // container for slider
		txtContainer: $('.slider--txt'), // container for text
		dots: false, // display dots
		arrows: true, // display arrows
		touch: false, // use hammer for touch events
		indicator: true, // display pagination
		preload: true, // preload des images avant affichage
		loader: true, // show loader when loading imgs
		keyboard: true, // utilisation des fleches du clavier
		adaptHeight: false, // height auto adapt depending on txt height
		responsive: false, // Breakpoints + new settings if needed
		debug: false, // Show console.log
		slides: [
			{
				"img": "https://imagesvc.timeincapp.com/v3/mm/image?url=http%3A%2F%2Fcdn-image.travelandleisure.com%2Fsites%2Fdefault%2Ffiles%2Fstyles%2F1600x1000%2Fpublic%2Fswiss1015-car-free-tourism.jpg%3Fitok%3DQ_1CN51B&w=800&q=85",
				"txt": "<p>Slide 1</p> <p>Slide 1</p>",
				"link": "http://www.google.fr"
			},
			{
				"img": "https://img.huffingtonpost.com/asset/5776bc951500002a006c952c.jpeg?cache=kbpsxfv2ao&ops=scalefit_600_noupscale",
				"txt": "<h3>Titre ?</h3> <p>slide 2 slide 2 slide 2 slide 2 slide 2 slide 2 slide 2 slide 2 slide 2 slide 2 slide 2 slide 2</p>"
			},
			{
				"img": "http://www.hdwallpaperup.com/wp-content/uploads/2015/02/Kirkjufell-Iceland-680x425.jpg",
				"txt": "<p>slide 3 slide 3 slide 3 slide 3 slide 3 slide 3 slide 3 slide 3 slide 3 slide 3 slide 3 slide 3 slide 3 slide 3 slide 3</p>"
			}
		]
	};
	var opts = $.extend({}, this.defaultOpts, opts || {});

	// CHECK IF TOUCH && HAMMER EXIST
	if(opts && opts.touch && typeof window.Hammer == 'undefined') {
		console.warn("[LightSlider] - HammerJS is required to handle touch events.");
		return;
	}
	// CHECK IF EVENTEMITTER EXIST
	if(typeof window.EventEmitter == 'undefined') {
		console.warn("[LightSlider] - EventEmitter.js is required");
		return;
	}
	this.emitter = new EventEmitter();

	this.firstOpts = opts;
	this.imgPreloaded = false;
	this.savedIndex = 0;
	this.savedBreakpoint = 0;

	this.initSlider(opts);
}

/**
 *  Init Slider
 */
LightSlider.prototype.initSlider = function(opts) {
	// Datas / Elements
	this.$container = opts.container;
	this.$navContainer = opts.navContainer;
	this.$imgContainer = opts.imgContainer;
	this.$txtContainer = opts.txtContainer;
	this.json = opts.slides;
	this.opts = opts;

	if(this.$container.length == 0 || this.$navContainer.length == 0 || this.$imgContainer.length == 0 || this.$txtContainer.length == 0) {
		console.warn("[LightSlider] - DOM doesn't exist in your HTML !");
		return;
	}

	// Vars
	this.isAnimated = false;
	this.index = 0;
	this.niceIndex = this.index + 1;
	this.nbSlide = this.json.length;

	// Events
	this.onResize = this.onResize.bind(this);
	this.onKeyDown = this.onKeyDown.bind(this);

	// Simulate promise
	this.promiseSlideAnim = this.promiseSlideAnim.bind(this);

	// Adapt slider on screen width
	$(window).on("resize", this.onResize);

	// Need preload image ?
	if(opts.preload) {
		this.preloadImgs();
	} else {
		this.initContent();
	}
}

/**
 *  Preload IMGS if preload == true
 */
LightSlider.prototype.preloadImgs = function() {
	var _this = this;
	if(this.imgPreloaded) {
		// Img déjà preload
		this.initContent();
		return;
	}
	if(this.opts.debug) {console.log("[LightSlider] - preload imgs");}
	this.emitter.emit('onPreload');

	if(this.opts.loader) {
		this.$container.append("<div class='slider--loader'><div></div></div>");
		TweenMax.to(this.$container.find(".slider--loader"), .5, {alpha: 1, ease: Expo.easeOut});
	}

	this.imgPreloadedCount = 0;
	for (var i = 0; i < this.nbSlide; i++) {
		var preloadImg = new Image();
		preloadImg.src = this.json[i].img;
		preloadImg.onload = function(e) {
			var imgHtml = e.path[0];
			var jsonIndex = _this.json.findIndex(function(el) {
				return el.img == e.path[0].src;
			})
			if(_this.opts.debug) {console.log("[LightSlider] - img "+jsonIndex+" loaded");}
			_this.json[jsonIndex].img = imgHtml;
			_this.imgPreloadedCount += 1;

			if(_this.imgPreloadedCount == _this.nbSlide) {
				_this.emitter.emit('endPreload')
				_this.imgPreloaded = true;
				_this.initContent();

				if(_this.opts.loader) {
					TweenMax.killTweensOf(_this.$container.find(".slider--loader"));
					TweenMax.to(_this.$container.find(".slider--loader"), .5, {alpha: 0, ease: Expo.easeOut, onComplete: function() {
						_this.$container.find(".slider--loader").hide();
					}});
				}
			}
		}
	}
}

/**
 *  Init Slider Content
 */
LightSlider.prototype.initContent = function() {
	if(this.opts.debug) {console.log("[LightSlider] - init slider");}
	this.emitter.emit('init');

	var firstImg = this.getImgHtml(0);
	var firstTxt = "<div>"+this.json[0].txt+"</div>";

	this.$imgContainer.html(firstImg);
	this.$txtContainer.html(firstTxt);

	if(this.opts.responsive) {
		this.initResponsive();
	}

	// Adapt slider depending on
	this.onResize();
	this.initNav();
}

/**
 *  Init Navigation DOM
 */
LightSlider.prototype.initNav = function() {
	if(this.opts.debug) {console.log("[LightSlider] - init nav");}
	var navHtml = "";
	if(this.opts.indicator) {
		navHtml += "<div class='indicator'>";
			navHtml += "<span class='indicator--current'>"+this.niceIndex+"</span>";
			navHtml += "<span class='indicator--last'>/"+this.nbSlide+"</span>";
		navHtml += "</div>";
	}
	if(this.opts.arrows) {
		navHtml += "<div class='arrows onStart'>";
			navHtml += "<div class='arrows--left'></div>";
			navHtml += "<div class='arrows--right'></div>";
		navHtml += "</div>";
	}
	if(this.opts.dots) {
		navHtml += "<div class='dots'>";
			for (var i = 0; i < this.nbSlide; i++) {
				navHtml += "<div class='dots--dot'></div>";
			}
		navHtml += "</div>";
	}

	this.$navContainer.html(navHtml);

	// New created elements
	if(this.opts.indicator) {
		this.$navContainer.addClass("hasIndicator");
		this.$currentIndic = this.$navContainer.find(".indicator--current");
	}
	if(this.opts.arrows) {
		this.$navContainer.addClass("hasArrows");
		this.arrows = {};
		this.arrows.$container = this.$navContainer.find(".arrows");
		this.arrows.$left = this.$navContainer.find(".arrows--left");
		this.arrows.$right = this.$navContainer.find(".arrows--right");
	}
	if(this.opts.dots) {
		this.$navContainer.addClass("hasDots");
		this.$navContainer.find(".dots--dot").eq(0).addClass("actif");
		this.$dots = this.$navContainer.find(".dots");
	}

	this.initEvents();
	if(this.opts.keyboard) {
		this.initKeyboard();
	}
	if(this.opts.touch) {
		this.initTouch();
	}
	if(this.savedIndex) {
		this.goTo(this.savedIndex, false);
		this.savedIndex = 0;
	}
}

/**
 *  Init Events for touch
 */
LightSlider.prototype.initTouch = function() {
	var _this = this;
	if(this.opts.debug) {console.log("[LightSlider] - init touch");}
	this.touch = new Hammer(_this.$container.get(0));

	this.touch.on("swipeleft", (e) => {
		e.preventDefault();
		_this.goNext();
	});
	this.touch.on("swiperight", (e) => {
		e.preventDefault();
		_this.goPrev();
	});
}

/**
 *  Init Events to use Slider
 */
LightSlider.prototype.initEvents = function() {
	var _this = this;
	if(this.opts.debug) {console.log("[LightSlider] - init events");}
	if(this.opts.arrows) {
		this.arrows.$left.on('click',(e) => {
			e.preventDefault();
			e.stopPropagation();
			_this.goPrev()
		});
		this.arrows.$right.on('click',(e) => {
			e.preventDefault();
			e.stopPropagation();
			_this.goNext()
		});
	}
}

/**
 *  Init Events for Keyboard
 */
LightSlider.prototype.initKeyboard = function() {
	if(this.opts.debug) {console.log("[LightSlider] - init keyboard");}
	$(window).on("keydown", this.onKeyDown);
}

/**
 *  Action on Key Down
 */
LightSlider.prototype.onKeyDown = function(e) {
	e.preventDefault();

	var key = e.keyCode || e.which;
	if(key == 37) {
		this.goPrev();
	} else if(key == 39) {
		this.goNext();
	}

	return false;
}

/**
 *  Go to Previous Slide
 */
LightSlider.prototype.goPrev = function() {
	if(this.index-1 < 0 || this.isAnimated) {
		return;
	}
	if(this.opts.debug) {console.log("[LightSlider] - go PREV");}

	this.index -= 1;
	this.niceIndex -= 1;

	this.startPromiseTl(this.index, "prev");

	this.checkNav();
}

/**
 *  Go to Next Slide
 */
LightSlider.prototype.goNext = function() {
	if(this.index+1 >= this.nbSlide || this.isAnimated) {
		return;
	}
	if(this.opts.debug) {console.log("[LightSlider] - go NEXT");}

	this.index += 1;
	this.niceIndex += 1;

	this.startPromiseTl(this.index, "next");

	this.checkNav();
}

/**
 *  Promise for slide animations
 */
LightSlider.prototype.startPromiseTl = function(index, dest) {
	if(this.isAnimated) {
		return false;
	}
	this.isAnimated = true;
	this.slideAnimEnded = 0;

	this.animImg(index, dest);
	this.animTxt(index, dest);

	this.promiseSlideAnim();
}

// Simulate promise in ES5
LightSlider.prototype.promiseSlideAnim = function() {
	if(this.slideAnimEnded >= 2) {
		this.isAnimated = false;
		this.slideAnimEnded = 0;
		cancelAnimationFrame(this.rq);
		return;
	}
	this.rq = requestAnimationFrame(this.promiseSlideAnim);
}

/**
 *  Animations for imgs
 */
LightSlider.prototype.animImg = function(index, dest) {
	var _this = this;
	this.$imgContainer.find("img").addClass("prevSlide");
	var newImg = $(this.getImgHtml(index)).addClass("nextSlide");
	this.$imgContainer.append(newImg);

	var $prevSlide = this.$imgContainer.find(".prevSlide");
	var $nextSlide = this.$imgContainer.find(".nextSlide");

	var tlSlider = new TimelineMax({ease: Expo.easeInOut, onComplete: function() {
		$prevSlide.removeClass("prevSlide").remove();
		$nextSlide.removeClass("nextSlide");
		_this.slideAnimEnded += 1;
	}});
	if(dest == "prev") {
		tlSlider.fromTo($nextSlide, 1, {y: "-50%", x: "-150%"}, {x: "-50%", ease: Expo.easeOut}, 0);
		tlSlider.fromTo($prevSlide, 1, {y: "-50%", x: "-50%"}, {x: "-20%", ease: Expo.easeOut}, 0);
	} else if(dest == "next") {
		tlSlider.fromTo($nextSlide, 1, {y: "-50%", x: "50%"}, {x: "-50%", ease: Expo.easeOut}, 0);
		tlSlider.fromTo($prevSlide, 1, {y: "-50%", x: "-50%"}, {x: "-80%", ease: Expo.easeOut}, 0);
	}
}

/**
 *  Animations for Txt
 */
LightSlider.prototype.animTxt = function(index, dest) {
	var _this = this;
	this.$txtContainer.children("div").addClass("prevTxt");
	var newTxt = $(this.getTxtHtml(index)).addClass("nextTxt");
	this.$txtContainer.append(newTxt);

	var $prevTxt = this.$txtContainer.find(".prevTxt");
	var $nextTxt = this.$txtContainer.find(".nextTxt");


	var tlSlider = new TimelineMax({ease: Expo.easeInOut, onComplete: function() {
		$prevTxt.removeClass("prevTxt").remove();
		$nextTxt.removeClass("nextTxt");
		_this.slideAnimEnded += 1;
	}});
	if(dest == "prev") {
		tlSlider.fromTo($nextTxt, .7, {x: -100, alpha: 0}, {x: 0, alpha: 1, ease: Expo.easeOut}, .2);
		tlSlider.fromTo($prevTxt, .5, {x: 0, alpha: 1}, {x: 100, alpha: 0, ease: Expo.easeOut}, 0);
	} else if(dest == "next") {
		tlSlider.fromTo($nextTxt, .7, {x: 100, alpha: 0}, {x: 0, alpha: 1, ease: Expo.easeOut}, .2);
		tlSlider.fromTo($prevTxt, .5, {x: 0, alpha: 1}, {x: -100, alpha: 0, ease: Expo.easeOut}, 0);
	}
	if(this.opts.adaptHeight) {
		tlSlider.to(this.$txtContainer, .3, {height: $nextTxt.innerHeight(), ease: Expo.easeOut}, 0);
	} else {
		this.$txtContainer.css("height", "");
	}
}

/**
 *  Change slide without anim
 */
LightSlider.prototype.changeSlide = function(index) {
	// Change TXT
	this.$txtContainer.children("div").remove();
	var newTxt = this.getTxtHtml(index);
	this.$txtContainer.append(newTxt);
	if(this.opts.adaptHeight) {
		TweenMax.to(this.$txtContainer, .3, {height: this.$txtContainer.find("div").innerHeight(), ease: Expo.easeOut});
	}

	// Change IMG
	this.$imgContainer.find("img").remove();
	var newImg = this.getImgHtml(index);
	this.$imgContainer.append(newImg);

	this.isAnimated = false;
}

/**
 *  Go to Slide Index
 */
LightSlider.prototype.goTo = function(index, transition) {
	if(index >= this.nbSlide || index < 0 || this.index == index || this.isAnimated) {
		return;
	}
	if(this.opts.debug) {console.log("[LightSlider] - go to slide n°"+index);}
	this.isAnimated = true;

	var dest = "next";
	if(index < this.index) {
		dest = "prev";
	}

	this.index = index;
	this.niceIndex = index + 1;

	if(transition != undefined && transition) {
		this.startPromiseTl(this.index, dest);
	} else {
		this.changeSlide(this.index);
	}

	this.checkNav();
}

/**
 *  Change navigation depending on index
 */
LightSlider.prototype.checkNav = function() {
	if(this.opts.arrows) {
		if(this.index <= 0 && !this.arrows.$container.hasClass('onStart')) {
			this.arrows.$container.removeClass('onEnd');
			this.arrows.$container.addClass('onStart');
		} else if(this.index > 0 && this.index < this.nbSlide-1 && (this.arrows.$container.hasClass('onStart') || this.arrows.$container.hasClass('onEnd'))) {
			this.arrows.$container.removeClass('onStart');
			this.arrows.$container.removeClass('onEnd');
		} else if(this.index >= this.nbSlide-1 && !this.arrows.$container.hasClass('onEnd')) {
			this.arrows.$container.addClass('onEnd');
			this.arrows.$container.removeClass('onStart');
		}
	}
	if(this.opts.indicator) {
		this.$currentIndic.text(this.niceIndex);
	}
	if(this.opts.dots) {
		this.$dots.find(".dots--dot").removeClass("actif");
		this.$dots.find(".dots--dot").eq(this.index).addClass("actif");
	}
}

/**
 *  AnimateIn
 */
LightSlider.prototype.animIn = function() {
	if(this.opts.debug) {console.log("[LightSlider] - Anim IN");}
	// TODO: Animation IN du slider
	this.emitter.emit('onAnimIn');
}

/**
 *  AnimateOut
 */
LightSlider.prototype.animOut = function() {
	if(this.opts.debug) {console.log("[LightSlider] - Anim OUT");}
	// TODO: Animation OUT du slider
	this.emitter.emit('onAnimOut');
}

/**
 *  Init Responsive
 */
LightSlider.prototype.initResponsive = function() {
	this.opts.responsive.sort(function(a,b) {
		return a.breakpoint - b.breakpoint;
	});
}

/**
 *  Events on resize window
 */
LightSlider.prototype.onResize = function() {
	if(this.opts.debug) {console.log("[LightSlider] - resize");}
	// Reset IMG transform
	this.$imgContainer.find("img").css("transform", "");

	// Change TXT Height
	if(this.opts.adaptHeight) {
		TweenMax.to(this.$txtContainer, .3, {height: this.$txtContainer.find("div").innerHeight(), ease: Expo.easeOut});
	}

	// If need to change settings / reinit slider
	if(this.opts.responsive) {
		this.newSettings = false;
		let breakActif = -1;
		for (var i = 0; i < this.opts.responsive.length; i++) {
			var el = this.opts.responsive[i];
			if(el.breakpoint >= $(window).innerWidth()) {
				breakActif = el.breakpoint;
				this.newSettings = el.settings;
				break;
			}
		}

		if(this.newSettings) {
			this.newSettings = $.extend({}, this.firstOpts, this.newSettings);
			if(this.newSettings && this.savedBreakpoint != breakActif) {
				this.savedBreakpoint = breakActif;
				this.reset(this.newSettings);
			}
		} else if(!this.newSettings && this.opts != this.firstOpts) {
			this.savedBreakpoint = 0;
			this.reset(this.firstOpts);
		}
	}
}

/**
 *  Reset content + reinit
 */
LightSlider.prototype.reset = function(settings) {
	var settings = settings || {};
	if(this.opts.debug) {console.log("[LightSlider] - reset");}
	this.savedIndex = this.index;
	this.$navContainer.find("arrows").removeClass("onEnd");
	this.$navContainer.find("arrows").removeClass("onStart");
	this.$navContainer.removeClass("hasArrows");
	this.$navContainer.removeClass("hasDots");
	this.$navContainer.removeClass("hasIndicator");
	this.$txtContainer.css("height", "");
	this.$imgContainer.html("");
	this.$txtContainer.html("");
	this.$navContainer.html("");
	this.destroy();

	this.initSlider(settings);
}

/**
 *  Destroy / remove events
 */
LightSlider.prototype.destroy = function() {
	if(this.opts.debug) {console.log("[LightSlider] - destroy");}
	$(window).off("resize", this.onResize);
	$(window).off("keydown", this.onKeyDown);
	if(this.opts.touch && this.touch) {
		this.touch.off("swipeleft");
		this.touch.off("swiperight");
	}
	if(this.opts.arrows && this.arrows) {
		this.arrows.$left.off('click');
		this.arrows.$right.off('click');
	}
}

/* * * * * * * *
 * * GETTEUR * *
 * * * * * * * */

/**
 *  Return IMG Balise from JSON depending on preload or not
 */
LightSlider.prototype.getImgHtml = function(index) {
	if(index < 0 || index > this.nbSlide-1) { return; }
	// Si preload, ou déjà une balise IMG
	let img = this.opts.preload || this.json[index].img.match("src=") ? this.json[index].img : "<img src='"+this.json[index].img+"' alt='' />";
	return img;
}

/**
 *  Return TXT html from JSON
 */
LightSlider.prototype.getTxtHtml = function(index) {
	if(index < 0 || index > this.nbSlide-1) { return; }
	// Ajout d'une div autour du HTML à rajouter
	let txt = "<div>"+this.json[index].txt+"</div>";
	return txt;
}