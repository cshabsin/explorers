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
    var $anchor = $makeSVGAnchor();

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

Hex.prototype.hilite = function(val) {
    if (this.cell && this.cell.anchor) {
	if (val) {
	    this.cell.anchor.children("path").attr(
		{"class": "map-hexagon-hilite"}
	    );
	} else {
	    this.cell.anchor.children("path").attr(
		{"class": "map-hexagon"}
	    );
	}
    }
};

Hex.prototype.makeDescription = function() {
    if (this.getHref()) {
	return "<a href='" + this.getHref() + "'>" + this.getName() + "</a>";
    } else {
	return this.getName();
    }
};

path = (function() {
    // NOTE: Has to be done after createMap, since it is what sets centers
    // on hexes. Move center generation to data? 
    
    function pointRel(hex, offset) {
	if (hex.cell == null) {
	    alert("No center for hex " + hex.name);
	}
	return [hex.cell.center[0] + offset[0], hex.cell.center[1] + offset[1]];
    }

    function PathSegment(sourceHex, sourceOffset, destinationHex,
			 destinationOffset) {
	this.sourceHex = sourceHex;
	this.sourceOffset = sourceOffset;
	this.destinationHex = destinationHex;
	this.destinationOffset = destinationOffset;
	this.element = null;
    }

    PathSegment.prototype.getPoints = function() {
	return [pointRel(this.sourceHex, this.sourceOffset), 
		pointRel(this.destinationHex, this.destinationOffset)];
    }

    PathSegment.prototype.makeDescription = function() {
	return this.sourceHex.getName() + " -> " + this.destinationHex.getName();
    }

    PathSegment.prototype.hilite = function(val) {
	if (this.element) {
	    if (val) {
		this.element.children(".spiny-rat").attr({
		    "class": "spiny-rat-hilite",
		    "marker-end": "url(#HiliteTriangle)",
		});
	    } else {
		this.element.children(".spiny-rat-hilite").attr({
		    "class": "spiny-rat",
		    "marker-end": "url(#Triangle)",
		});
	    }
	}
    }

    return {
	pointRel: pointRel,
	PathSegment: PathSegment,
    };
})();

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
