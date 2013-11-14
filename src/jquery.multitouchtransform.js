;(function($) {
	// Create the defaults once
	var pluginName = "multitouchTransform",
		defaults = {
			dimensions: {
				width: 612,
				height: 612
			},
			viewportScale: 1,
			autoScale: true,
			rotate: true,
			scale: true,
			elInitialScale: 0.5,
			elScaleBounds: {
				max: 1,
				min: 0.2
			},
			navSelector: false,
			onDraw: false,
			onAdd: false,
			onRemove: false
		};

	// The actual plugin constructor

	function Plugin(element, options) {

		this.element = $(element);
		this.opts = $.extend({}, defaults, options);

		this.activeElement = undefined;
		this.ignoreEvents = false;
		this.boundaries = undefined;
		this.nav = undefined;
		this.index = 1;

		this._defaults = defaults;
		this._name = pluginName;
		this.disabled = false;

		this.init();
	}

	Plugin.prototype = {

		init: function() {
			this.element.find('img').on('dragstart', $.proxy(function(event) {
				if(!this.disabled)event.preventDefault();
			},this));
			this.element.on('touchmove', $.proxy(function(event) {
				if(!this.disabled)event.preventDefault();
			},this));
			this.element.hammer().on('transformstart', $.proxy(this.onTransformStart, this));
			this.element.hammer().on('transform', $.proxy(this.onTransform, this));
			this.element.hammer().on('dragstart', $.proxy(this.onDragStart, this));
			this.element.hammer().on('drag', $.proxy(this.onDrag, this));
			this.element.hammer().on('release', $.proxy(this.onRelease, this));
			this.element.addClass('mt-transform-viewport mt-transform');
			this.scaleViewport(this.opts.viewportScale);

			this.boundaries = {
				x1: 0,
				y1: 0,
				x2: this.opts.dimensions.width,
				y2: this.opts.dimensions.height
			}

			if (this.opts.navSelector) {
				this.nav = $(this.opts.navSelector).addClass('mt-transform-list');
				this.nav.on('click', 'li', $.proxy(this.navListBehaviour, this))
			}
			if (this.opts.autoScale) {
				$(window).resize($.proxy(this.scaleViewport, this));
			}
		},

		/*PUBLICLY AVAILABLE METHODS*/
		disable: function(){
			this.disabled = true;
		},
		enable: function(){
			this.disabled = false;
		},
		addCustom: function(el) {
			el.addClass('mt-transform-element').appendTo(this.element);
			el.css({
				left: -el.width() / 2,
				top: -el.height() / 2,
				translate: [this.opts.dimensions.width / 2, this.opts.dimensions.height / 2],
				scale: this.opts.elInitialScale
			})
			el.data('index', this.index);
			el.data('resource_id', 'custom_' + this.index);
			
			if (this.opts.navSelector) {
				var listEl = $("<li>").text('custom_' + this.index).appendTo(this.nav);
				//$('<a>').addClass('mt-transform-delete').text('x').appendTo(listEl);
				listEl.data('index', this.index);
			}

			//select newly created element
			this.select(el.data("index"));
			this.index++

			if(this.opts.onAdd)this.opts.onAdd(el,this);

		},
		add: function(params) {
			var newElement = $('<img/>').attr('src', params.url).addClass('mt-transform-element').appendTo(this.element);
			newElement.css({
				left: -params.width / 2,
				top: -params.height / 2,
				translate: [this.opts.dimensions.width / 2, this.opts.dimensions.height / 2],
				scale: this.opts.elInitialScale,
			});

			newElement.data('index', this.index);
			newElement.data('resource_id', params.id);

			if (this.opts.navSelector) {
				var listEl = $("<li>").text(params.id).appendTo(this.nav);
				//$('<a>').addClass('mt-transform-delete').text('x').appendTo(listEl);
				listEl.data('index', this.index);
			}

			//select newly created element
			this.select(newElement.data("index"));
			this.index++

			if(this.opts.onAdd)this.opts.onAdd(newElement,this);
		},
		select: function(index) {
			var plugin = this;
			var targetElement;

			this.element.find('.mt-transform-element').each(function() {
				if ($(this).data('index') == index) {
					plugin.activeElement = $(this);
					$(this).addClass('mt-transform-active').siblings('.mt-transform-element').removeClass('mt-transform-active');
					return false;
				}
			});

			if (this.opts.navSelector) {
				this.nav.find('li').each(function() {
					if ($(this).data('index') == index) {
						$(this).addClass('mt-transform-active').siblings().removeClass('mt-transform-active');
						return false;
					}
				})

			}
		},
		clear: function() {
			this.activeElement = undefined;
			this.element.find(".mt-transform-element").remove();
			if (this.opts.navSelector) {
				this.nav.empty();
			}
			
			if(this.opts.onRemove)this.opts.onRemove(this);
		},
		remove: function(index) {
			var targetElement;
			if (index) {
				this.element.find('.mt-transform-element').each(function() {
					if (index == $(this).data('index')) {
						targetElement = $(this);
						return false;
					}
				})
			} else {
				targetElement = this.activeElement;
			}

			if (targetElement) {
				if (this.opts.navSelector) {
					this.nav.find('li').each(function() {
						if (targetElement.data('index') == $(this).data('index')) {
							$(this).remove();
							return false;
						}
					})
				}
				targetElement.remove();
				this.activeElement = undefined;

				var lastAdded = this.element.find('.mt-transform-element').last().data();
				if (lastAdded) this.select(lastAdded.index);

				if(this.opts.onRemove)this.opts.onRemove(this);
				return true;
			} else {
				return false;
			}
		},
		scaleViewport: function(scale) {
			if (!scale || isNaN(scale)) var scale = this.element.parent().innerWidth() / this.element.width();
			this.element.css("scale", scale)
			this.element.css("-webkit-transform-origin", "top left");
			this.opts.viewportScale = scale;

			var parentHeight = this.opts.dimensions.height * scale;
			this.element.parent().height(parentHeight);

		},
		getData: function(ignoreScale) {
			var scale =  this.opts.viewportScale;
			var plugin = this;
			var transformations = [];

			this.element.find('.mt-transform-element').each(function(i, element) {
				var boundingBox = element.getBoundingClientRect();
				var offset = plugin.element.offset();
				offset.left -= window.pageXOffset;
				offset.top -= window.pageYOffset;

				transformations.push({
					id: $(element).data('resource_id'),
					angle: Math.round(String($(element).css('rotate')).replace("deg", "")),
					width: Math.round(boundingBox.width / scale),
					height: Math.round(boundingBox.height / scale),
					x: Math.round((boundingBox.left - offset.left) / scale),
					y: Math.round((boundingBox.top - offset.top) / scale)

				})
			})

			return transformations;
		},
		getCurrentIndex: function() {
			if (this.activeElement) {
				return this.activeElement.data('index');
			} else {
				return false;
			}
		},
		// INTERNAL FUNCTIONS AND EVENT HANDLERS
		navListBehaviour: function(evt) {
			var target = $(evt.target);
			if (target.hasClass('mt-transform-delete')) {
				this.remove($(evt.currentTarget).data("index"));
			} else {
				this.select($(evt.currentTarget).data("index"));
			}
		},
		onTransformStart: function(evt) {
			if(this.disabled) return;
			if (!this.activeElement) return;

			if (this.opts.scale) this.activeElement.data('scale', this.activeElement.css('scale'));
			if (this.opts.rotate) {
				this.activeElement.data('rotation', parseInt(this.activeElement.css('rotate')));
				$(evt.currentTarget).data('startingRotation', evt.gesture.rotation);
			}
			this.ignoreEvents = true;
		},
		onTransform: function(evt) {
			if(this.disabled) return;
			if (!this.activeElement) return;

			var transformObject = {};

			if (this.opts.scale) {
				var prevScale = this.activeElement.data('scale');
				var scaleVal = Math.min(this.opts.elScaleBounds.max, Math.max(this.opts.elScaleBounds.min, prevScale * evt.gesture.scale));
				transformObject.scale = scaleVal
			}
			if (this.opts.rotate) {
				var startingRotation = this.activeElement.data('rotation');
				var deltaRotation = startingRotation + evt.gesture.rotation;
				var newRotation = $(evt.currentTarget).data('startingRotation') + deltaRotation;

				transformObject.rotate = newRotation + "deg";
			}

			if(this.opts.onDraw)this.opts.onDraw(this, evt);

			this.activeElement.css(transformObject);

			var coords = this.activeElement.css('translate').replace(/px/g, '').split(',');
			this.applyBoundaries(coords[0], coords[1]);
		},
		onDragStart: function(evt) {
			if(this.disabled) return;
			if (!this.activeElement) return;

			var currentOffset = this.activeElement.css('translate').replace(/px/g, '').split(',');
			this.activeElement.data("offset", currentOffset);
		},
		onDrag: function(evt) {
			if(this.disabled) return;
			if (this.ignoreEvents) return;
			if (!this.activeElement) return;

			var offset = this.activeElement.data("offset");
			var newX = parseInt(offset[0]) + (evt.gesture.deltaX / this.opts.viewportScale);
			var newY = parseInt(offset[1]) + (evt.gesture.deltaY / this.opts.viewportScale);


			if(this.opts.onDraw)this.opts.onDraw(this, evt);

			this.applyBoundaries(newX, newY);

			evt.gesture.preventDefault();
		},
		onRelease: function(evt) {
			this.ignoreEvents = false;
		},
		applyBoundaries: function(newX, newY) {
			var newPosition = [
				Math.max(this.boundaries.x1, Math.min(this.boundaries.x2, newX)) + "px",
				Math.max(this.boundaries.y1, Math.min(this.boundaries.y2, newY)) + "px"
			];

			this.activeElement.css({
				translate: newPosition
			});
		}
	};

	$.fn[pluginName] = function(optionsOrMethod, methodOptions) {
		if (typeof optionsOrMethod == 'object') {
			if (!this.data("plugin_" + pluginName)) {
				var instance = new Plugin(this, optionsOrMethod)
				this.data("plugin_" + pluginName, instance);
			}
		} else {
			var instance = this.data("plugin_" + pluginName);
			if (!instance) {
				console.error(pluginName + ' not initialized on this element');
				return false;
			}
			switch (optionsOrMethod) {
				case 'add':
				case 'addCustom':
				case 'remove':
				case 'clear':
				case 'scaleViewport':
				case 'getData':
				case 'getCurrentIndex':
				case 'disable':
				case 'enable':
					return instance[optionsOrMethod](methodOptions);
					break;
				default:
					console.error('Method not available on ' + pluginName);
					return false;
					break;
			}
		}
	};

})(jQuery, window, document);