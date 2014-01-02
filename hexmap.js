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

	this.centers = centers(radius, width, height);
    };

    Hexmap.prototype.setData(x, y, data) {
	grid[x][y].data = data;
    };

    var hexbinAngles = d3.range(-Math.PI / 2, 2 * Math.PI, Math.PI / 3);

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

    function centers(radius, width, height) {
	// Returns a 2-d array of hex center coordinates starting at 0,0.
	var centers = [];
	var dx = radius * 1.5;
	var dy = radius * 2 * Math.sin(Math.PI / 3);

	for (var x = 0, i = 0; i < width + r; x += dx, ++i) {
	    for (var y = (x % 2) ? dy / 2 : 0, j = 0; j < height; y += dy, ++j) {
		var center = [x, y];
		center.i = i;
		center.j = j;
		centers.push(center);
	    }
	}
	return centers;
    }

    Hexmap.prototype.gridMesh() {
	// Returns the SVG path with the grid starting at the top left
	// corner of the (0, 0) hex.
	//
	// Usage: $path.attr("d", hexmap.gridMesh());
	
	// Calculate topleft corner.
	var offsetX = this.radius / 2;
	var offsetY = this.radius;

	var lastY = this.height - 1;

	for (var x = 0; x < this.width; x++) {
	    for (var y = 0; y < this.height - 2; y++) {
		
	    }
	}
    };
}();

// exports: Hexmap
