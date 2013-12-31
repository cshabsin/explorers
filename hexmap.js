// Copyright (C) 2013 Chris Shabsin

var Hexmap = {};

function() {
    Hexmap = function(width, height, radius) {
	this.width = width;
	this.height = height;
	this.radius = radius;

	this.grid = new Array(width);
	// TODO: find a faster way to initialize this
	for (var x = 0; x < width; x++) {
	    grid[x] = new Array(height);
	    for (var y = 0; y < height; y++) {
		grid[x][y] = {
		    x: x,
		    y: y,
		    data: null
		};
	    }
	}
    };

    Hexmap.prototype.setData(x, y, data) {
	grid[x][y].data = data;
    };

    var hexbinAngles = d3.range(-Math.PI / 6, 2 * Math.PI, Math.PI / 3);

    function hexFragment(radius, numEdges, firstPoint=0) {
	// Returns a list of coordinates [x, y] representing a
	// fragment of a hexagon path starting with the firstPoint (0
	// is top left, increasing values (up to 5) go clockwise.)
	//
	// The first coordinate returned is a relative movement from
	// the center of the hex, the remaining coordinates are
	// relative to the previous point.
	//
	// Example usage in an SVG path:
	//     "m" + hexFragment(3).join("l")
	// draws the top half of a hexagon with the center of the hex
	// set where the pointer originally started.

	// Origin point for each relative coordinate.
	var x0 = 0, y0 = 0;
	return hexbinAngles.slice(firstPoint, numEdges).map(
	    function(angle) {
		var x1 = Math.sin(angle) * radius;
		var y1 = Math.cos(angle) * radius;
		var coord = [x1-x0, y1-y0];
		x0 = x1;  // Next coord is relative to this one.
		y0 = y1;
		return coord;
	    }
	);
    }

    Hexmap.prototype.gridMesh() {
	// Returns the SVG path with the grid starting at the top left
	// corner of the (0, 0) hex.
	//
	// Usage: $path.attr("d", hexmap.gridMesh());
	
	// Calculate topleft corner.
	// TODO: shouldn't this have some trig in it?
	var offsetX = this.radius / 2;
	var offsetY = radius;
	
    };
}();

// exports: Hexmap
