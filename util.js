// Copyright (C) 2013 Chris Shabsin

function Hex(c, r) {
    this.c = c;
    this.r = r;
    this.cell = null;
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
Hex.prototype.setCell = function(n) { this.cell = n; return this; };

Hex.prototype.makeAnchor = function() {
    var $anchor = $makeSVGAnchor(this.getHref());

    $anchor.append($makeSVG("path", {
	"class": "map-hexagon",
	d: myMap.getHexagon(),
    }));

    $anchor.append($makeSVG("text", {
	y: 50,
	"class": this.getHref() ? "map-coord-link" : "map-coord",
    }).text(this.getDisplayCoord()));

    if (this.getName()) {
	$anchor.append($makeSVG("text", {
	    y: 20,
	    "class": this.getHref() ? "map-name-link" : "map-name",
	}).text(this.getName()));
    }

    if (this.hasSystem()) {
	$anchor.append($makeSVG("circle", {
	    cx: 0,
	    cy: 0,
	    r: 5,
	    "class":
	        this.getHref() ? "map-planet-link": "map-planet",
	}));
    }

    return $anchor;
};

// Create a properly-namespaced SVG element
function makeSVG(tag, attrs) {
    var elem = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (var key in attrs) {
        elem.setAttribute(key, attrs[key]);
    }
    return elem;
}

function makeSVGAnchor(href, attrs) {
    var anchor = makeSVG("a", attrs);
    if (href) {
	anchor.setAttributeNS("http://www.w3.org/1999/xlink",
			      "href", href);
    }
    return anchor;
}

function $makeSVG(tag, attrs) {
    return $(makeSVG(tag,attrs))
}

function $makeSVGAnchor(href, attrs) {
    return $(makeSVGAnchor(href, attrs));
}
