// Copyright (C) 2013 Chris Shabsin

model = (function() {

    // Pass a data entity constructor to add Entity methods to its
    // prototype.
    function makeEntityLike(ClassConstructor) {
	// description() -> return the description.
	// description(desc) -> set the description, return the Entity.
	ClassConstructor.prototype.description = function(desc) {
	    if (desc) {
		this._description = desc;
		return this;
	    }
	    return this._description;
	};

	// href() -> return the href.
	// href(desc) -> set the href, return the Entity.
	ClassConstructor.prototype.href = function(href) {
	    if (href) {
		this._href = href;
		return this;
	    }
	    return this._href;
	};
	
	// Override to generate the appropriate verbose descriptive
	// text for the entity.
	ClassConstructor.prototype.makeDescription = function() {
	    return "Unimplemented."
	};

	ClassConstructor.prototype.setHiliteCallback = function(cb) {
	    this._hiliteCallback = cb;
	};

	ClassConstructor.prototype.hilite = function(val) {
	    if (this._hiliteCallback) {
		this._hiliteCallback(val);
	    }
	};
    }

    /// Hex.
    function Hex(c, r) {
	this._c = c;
	this._r = r;
	this._name = "";
	this._suppressPlanet = false;
    }

    makeEntityLike(Hex);

    Hex.prototype.col = function(c) {
	if (c) {
	    this._c = c;
	    return this;
	}
	return this._c;
    };
    Hex.prototype.row = function(r) {
	if (r) {
	    this._r = r;
	    return this;
	}
	return this._r;
    };
    Hex.prototype.name = function(n) {
	if (n) {
	    this._name = n;
	    return this;
	}
	return this._name;
    };
    Hex.prototype.hasSystem = function() {
	return !this._suppressPlanet && this._name;
    };
    Hex.prototype.getDisplayCoord = function() {
	function dig(n) {
	    if (n > 10) {
		return String(n);
	    } else {
		return "0" + String(n);
	    }
	}
	return dig(this._c + first_c) + dig(this._r + first_r);
    };

    Hex.prototype.makeDescription = function() {
	var rc = this.getDisplayCoord() + " - "
	if (this.href()) {
	    rc += "<a href='" + this.href() + "'>" + this.name() + "</a>";
	} else {
	    if (this.name()) {
		rc += this.name();
	    } else {
		rc += "No system";
	    }
	}
	var desc = this.description();
	if (desc) {
	    rc += "<p>" + desc;
	}
	return rc;
    };

    return {
	Hex: Hex,
    };

})();


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
