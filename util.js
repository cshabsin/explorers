// Copyright (C) 2013 Chris Shabsin

function Hex(c, r) {
    this.c = c;
    this.r = r;
    this.center = null;
    this.name = "";
    this.href = null;
    this.suppressPlanet = false;
}

Hex.prototype.getCol = function() { return this.c; };
Hex.prototype.getRow = function() { return this.r; };
Hex.prototype.getName = function() { return this.name; };
Hex.prototype.getHref = function() { return this.href; };
Hex.prototype.hasSystem = function(n) { return !this.suppressPlanet && this.name; };
Hex.prototype.getDisplayCoord = function() {
    function dig(n) {
	if (n > 10) {
	    return String(n);
	} else {
	    return "0" + String(n);
	}
    }
    return dig(this.c + first_c) + dig(this.r + first_r);
};

Hex.prototype.setName = function(n) { this.name = n; return this; };
Hex.prototype.setHref = function(n) { this.href = n; return this; };
Hex.prototype.setCenter = function(n) { this.center = n; return this; };

// Create a properly-namespaced SVG element
function makeSVG(tag, attrs) {
    var elem = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (var key in attrs) {
        elem.setAttribute(key, attrs[key]);
    }
    return elem;
}

function $makeSVG(tag, attrs) {
    return $(makeSVG(tag,attrs))
}

function $makeSVGAnchor(href, attrs) {
    var $anchor = $makeSVG("a", attrs);
    if (href) {
	$anchor.get(0).setAttributeNS("http://www.w3.org/1999/xlink",
				      "href", href);
    }
    return $anchor;
}
