/*! jquery.multitouchtransform 2013-10-31 */
!function(a) {
    function b(b, e) {
        this.element = a(b), this.opts = a.extend({}, d, e), this.activeElement = void 0, 
        this.ignoreEvents = !1, this.boundaries = void 0, this.nav = void 0, this.index = 1, 
        this._defaults = d, this._name = c, this.init();
    }
    var c = "multitouchTransform", d = {
        dimensions: {
            width: 612,
            height: 612
        },
        viewportScale: 1,
        autoScale: !0,
        rotate: !0,
        scale: !0,
        elInitialScale: .5,
        elScaleBounds: {
            max: 1,
            min: .2
        },
        navSelector: !1,
        onDraw: a.noop
    };
    b.prototype = {
        init: function() {
            this.element.find("img").on("dragstart", function(a) {
                a.preventDefault();
            }), this.element.on("touchmove", function(a) {
                a.preventDefault();
            }), this.element.hammer().on("transformstart", a.proxy(this.onTransformStart, this)), 
            this.element.hammer().on("transform", a.proxy(this.onTransform, this)), this.element.hammer().on("dragstart", a.proxy(this.onDragStart, this)), 
            this.element.hammer().on("drag", a.proxy(this.onDrag, this)), this.element.hammer().on("release", a.proxy(this.onRelease, this)), 
            this.element.addClass("mt-transform-viewport mt-transform"), this.scaleViewport(this.opts.viewportScale), 
            this.boundaries = {
                x1: 0,
                y1: 0,
                x2: this.opts.dimensions.width,
                y2: this.opts.dimensions.height
            }, this.opts.navSelector && (this.nav = a(this.opts.navSelector).addClass("mt-transform-list"), 
            this.nav.on("click", "li", a.proxy(this.navListBehaviour, this))), this.opts.autoScale && a(window).resize(a.proxy(this.scaleViewport, this));
        },
        addCustom: function(b) {
            if (b.addClass("mt-transform-element").appendTo(this.element), b.css({
                left: -b.width() / 2,
                top: -b.height() / 2,
                translate: [ this.opts.dimensions.width / 2, this.opts.dimensions.height / 2 ],
                scale: this.opts.elInitialScale
            }), b.data("index", this.index), b.data("resource_id", "custom_" + this.index), 
            this.opts.navSelector) {
                var c = a("<li>").text("custom_" + this.index).appendTo(this.nav);
                a("<a>").addClass("delete").text("x").appendTo(c), c.data("index", this.index);
            }
            this.select(b.data("index")), this.index++;
        },
        add: function(b) {
            var c = a("<img/>").attr("src", b.url).addClass("mt-transform-element").appendTo(this.element);
            if (c.css({
                left: -b.width / 2,
                top: -b.height / 2,
                translate: [ this.opts.dimensions.width / 2, this.opts.dimensions.height / 2 ],
                scale: this.opts.elInitialScale
            }), c.data("index", this.index), c.data("resource_id", b.id), this.opts.navSelector) {
                var d = a("<li>").text(b.id).appendTo(this.nav);
                a("<a>").addClass("delete").text("x").appendTo(d), d.data("index", this.index);
            }
            this.select(c.data("index")), this.index++;
        },
        select: function(b) {
            var c = this;
            this.element.find(".mt-transform-element").each(function() {
                return a(this).data("index") == b ? (c.activeElement = a(this), !1) : void 0;
            }), this.opts.navSelector && this.nav.find("li").each(function() {
                return a(this).data("index") == b ? (a(this).addClass("active").siblings().removeClass("active"), 
                !1) : void 0;
            });
        },
        clear: function() {
            activeElement = void 0, this.element.find("mt-transform-element").remove(), this.opts.navSelector && this.opts.navSelector.empty();
        },
        remove: function(b) {
            var c;
            if (b ? this.element.find(".mt-transform-element").each(function() {
                return b == a(this).data("index") ? (c = a(this), !1) : void 0;
            }) : (console.log("no index provided"), c = this.activeElement), c) {
                this.opts.navSelector && this.nav.find("li").each(function() {
                    return c.data("index") == a(this).data("index") ? (a(this).remove(), !1) : void 0;
                }), c.remove(), this.activeElement = void 0;
                var d = this.element.find(".mt-transform-element").last().data();
                return d && this.select(d.index), !0;
            }
            return !1;
        },
        scaleViewport: function(a) {
            if (!a || isNaN(a)) var a = this.element.parent().innerWidth() / this.element.width();
            this.element.css("scale", a), this.element.css("-webkit-transform-origin", "top left"), 
            this.opts.viewportScale = a;
            var b = this.opts.dimensions.height * a;
            this.element.parent().height(b);
        },
        getData: function() {
            var b = this.opts.viewportScale, c = this, d = [];
            return this.element.find(".mt-transform-element").each(function(e, f) {
                var g = f.getBoundingClientRect(), h = c.element.offset();
                h.left -= window.pageXOffset, h.top -= window.pageYOffset, d.push({
                    id: a(f).data("resource_id"),
                    angle: Math.round(String(a(f).css("rotate")).replace("deg", "")),
                    width: Math.round(g.width / b),
                    height: Math.round(g.height / b),
                    x: Math.round((g.left - h.left) / b),
                    y: Math.round((g.top - h.top) / b)
                });
            }), d;
        },
        getCurrentIndex: function() {
            return this.activeElement ? this.activeElement.data("index") : !1;
        },
        navListBehaviour: function(b) {
            var c = a(b.target);
            c.hasClass("delete") ? this.remove(a(b.currentTarget).data("index")) : this.select(a(b.currentTarget).data("index"));
        },
        onTransformStart: function(b) {
            this.activeElement && (this.opts.scale && this.activeElement.data("scale", this.activeElement.css("scale")), 
            this.opts.rotate && (this.activeElement.data("rotation", parseInt(this.activeElement.css("rotate"))), 
            a(b.currentTarget).data("startingRotation", b.gesture.rotation)), this.ignoreEvents = !0);
        },
        onTransform: function(b) {
            if (this.activeElement) {
                var c = {};
                if (this.opts.scale) {
                    var d = this.activeElement.data("scale"), e = Math.min(this.opts.elScaleBounds.max, Math.max(this.opts.elScaleBounds.min, d * b.gesture.scale));
                    c.scale = e;
                }
                if (this.opts.rotate) {
                    var f = this.activeElement.data("rotation"), g = f + b.gesture.rotation, h = a(b.currentTarget).data("startingRotation") + g;
                    c.rotate = h + "deg";
                }
                this.opts.onDraw(this, b), this.activeElement.css(c);
                var i = this.activeElement.css("translate").replace(/px/g, "").split(",");
                this.applyBoundaries(i[0], i[1]);
            }
        },
        onDragStart: function() {
            if (this.activeElement) {
                var a = this.activeElement.css("translate").replace(/px/g, "").split(",");
                this.activeElement.data("offset", a);
            }
        },
        onDrag: function(a) {
            if (!this.ignoreEvents && this.activeElement) {
                var b = this.activeElement.data("offset"), c = parseInt(b[0]) + a.gesture.deltaX / this.opts.viewportScale, d = parseInt(b[1]) + a.gesture.deltaY / this.opts.viewportScale;
                this.opts.onDraw(this, a), this.applyBoundaries(c, d), a.gesture.preventDefault();
            }
        },
        onRelease: function() {
            this.ignoreEvents = !1;
        },
        applyBoundaries: function(a, b) {
            var c = [ Math.max(this.boundaries.x1, Math.min(this.boundaries.x2, a)) + "px", Math.max(this.boundaries.y1, Math.min(this.boundaries.y2, b)) + "px" ];
            this.activeElement.css({
                translate: c
            });
        }
    }, a.fn[c] = function(a, d) {
        if ("object" == typeof a) {
            if (!this.data("plugin_" + c)) {
                var e = new b(this, a);
                this.data("plugin_" + c, e);
            }
        } else {
            var e = this.data("plugin_" + c);
            if (!e) return console.error(c + " not initialized on this element"), !1;
            switch (a) {
              case "add":
              case "addCustom":
              case "remove":
              case "scaleViewport":
              case "getData":
              case "getCurrentIndex":
                return e[a](d);

              default:
                return console.error("Method not available on " + c), !1;
            }
        }
    };
}(jQuery, window, document);