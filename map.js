// Copyright (C) 2013 Chris Shabsin

function createMap(container, hexArray) {
    var radius = 70;
    var hexbin = d3.rhexbin().radius(radius);
    hexbin.size([cols * hexbin.dx(), rows * hexbin.dy()]);

    var translate_x = 1-radius/2;
    var translate_y = 10-radius;

    var svg = container.append("svg").
	attr("id", "map-svg").
	attr("height", rows*hexbin.dy() + 2).
	attr("width", cols*hexbin.dx()-translate_x + 2);

    var centers = hexbin.centers();
    centers.forEach(function(center) {
	effective_i = center.i - 1;
	effective_j = center.j - 1;
	if (effective_i < 0 || effective_j < 0) {
	    return;
	}
	if (effective_i >= hexArray.length || effective_j >= hexArray[0].length) {
	    return;
	}
	center.hex = hexArray[effective_i][effective_j];
	center.href = center.hex.getHref();
	center.name = center.hex.getName() || center.hex.getDisplayCoord();

	center.hex.setCenter(center);
    });

    var g = svg.append("g").
	attr("transform", "translate(" + translate_x + "," + translate_y + ")").
	attr("class", "map-anchor-group");
    g.append("path").
	attr("class", "map-mesh").
	attr("d", hexbin.mesh);

    var anchors = g.
	selectAll("a").
	data(centers);
    anchors.exit().remove();
    var hexElems = anchors.enter().append("a").
	attr("class", "map-anchor");

    hexElems.attr("transform", function(d) { return "translate(" + d + ")" });
    hexElems.append("path").
	attr("class", "map-hexagon").
	attr("d", hexbin.hexagon());
    hexElems.append("text").
	attr("y", 50).
	attr("class", function(d) {
	    if (d.hex && d.hex.getHref()) {
		return "map-coord-link";
	    } else {
		return "map-coord";
	    }
	}).
	text(function(d) { if (d.hex) { return d.hex.getDisplayCoord(); } });

    var hexesWithSystemNames = hexElems.filter(function(d) {
	if (d.hex && d.hex.getName()) {
	    return d;
	}
    });
    hexesWithSystemNames.append("text").
	attr("y", 20).
	attr("class", function(d) { 
	    if (d.hex && d.hex.getHref()) {
		return "map-name-link";
	    } else {
		return "map-name";
	    }
	}).
	text(function(d) {
	    if (d.hex && d.hex.getName()) {
		return d.hex.getName();
	    }
	});
    var hexesWithSystems = hexElems.filter(function(d) {
	if (d.hex && d.hex.hasSystem()) {
	    return d;
	}
    });
    hexesWithSystems.
	append("circle").
	attr("cx", 0).
	attr("cy", 0).
	attr("r", 5).
	attr("class", function(d) {
	    if (d.hex && d.hex.getHref()) {
		return "map-planet-link";
	    } else {
		return "map-planet";
	    }
	});
    hexesWithSystems.attr("xlink:href", function(d) { return d.href; });

    return [svg, g];
};

// exports: createMap
