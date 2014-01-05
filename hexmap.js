// Copyright (C) 2013 Chris Shabsin

var hexmap = (function() {
    var Hexmap = function(width, height, radius, staggerUp) {
	// width and height are counted in cells.
	this.width = width;
	this.height = height;

	// radius of a cell (in pixels? What does SVG count in?)
	this.radius = radius;

	// If staggerUp, then top left corner is up and to the left of
	// the cell to its right. Otherwise, it is down and to the
	// left of the cell to its right.
	this.staggerUp = staggerUp || false;

	this.dx = radius * 1.5;
	this.dy = radius * 2 * Math.sin(Math.PI / 3);

	this.grid = new Array(width);
	// TODO: find a faster, more JSish, way to initialize this.
	for (var x = 0; x < width; x++) {
	    this.grid[x] = new Array(height);
	    for (var y = 0; y < height; y++) {
		this.grid[x][y] = {
		    x: x,
		    y: y,
		    data: null,
		    meshDraw: null,
		    meshShown: true,
		    center: calculateCenter(this, x, y)
		};
	    }
	}
    };

    Hexmap.prototype.setData = function(x, y, data) {
	grid[x][y].data = data;
    };

    Hexmap.prototype.gridMesh = function() {
	// Returns the SVG path with the grid starting at the top left
	// corner of the (0, 0) hex.
	//
	// Usage: $path.attr("d", hexmap.gridMesh());
	
	// Calculate topleft corner.
	var offsetX = this.radius / 2;
	var offsetY = this.radius;

	var lastY = this.height - 1;
	var hex = hexagon(this.radius);

	// drawn[0] = top left, going clockwise. 0, 1, 2, and 5 are
	// always true, while 3 and 4 are recalculated per cell to
	// avoid double-drawing any edges.
	var drawn = [true, true, true, true, true, true];
	var path = "";

	for (var x = 0; x < this.width; x++) {
	    for (var y = 0; y < this.height; y++) {
		if (!this.grid[x][y].meshShown) {
		    continue;
		}
		path += "M" + this.grid[x][y].center + "\n";
		path += "m" + hex[0] + "\n";
		// draw these edges only if we're not going to draw that edge again.
		drawn[3] = !isDownRightShown(this, x, y);
		drawn[4] = !isDownShown(this, x, y);
		for (var i = 0 ; i < 6; i++) {
		    if (drawn[i]) {
			path += "l" + hex[i+1] + "\n";
		    } else {
			path += "m" + hex[i+1] + "\n";
		    }
		}
	    }
	}
	return path;
    };

    var hexbinAngles = [ -Math.PI / 2, -Math.PI / 6, Math.PI / 6, Math.PI / 2,
			 5 * Math.PI / 6, 7 * Math.PI / 6, 3 * Math.PI / 2 ];

    function isCellShown(mapobj, col, row) {
	if (col >= mapobj.width || row >= mapobj.height) {
	    return false;
	}
	return mapobj.grid[col][row].meshShown;
    }

    function isDownRightShown(mapobj, col, row) {
	if (isCellDown(mapobj, col, row)) {
	    return isCellShown(mapobj, col+1, row+1);
	} else {
	    return isCellShown(mapobj, col+1, row);
	}
    }

    function isDownShown(mapobj, col, row) {
	return isCellShown(mapobj, col, row+1);
    }

    // Returns true if the cell is a "down" cell in its row.
    function isCellDown(mapobj, col, row) {
	if (mapobj.staggerUp) {
	    return col % 2 == 1;
	} else {
	    return col % 2 == 0;
	}
    }

    function calculateCenter(mapobj, col, row) {
	x = mapobj.dx * col + mapobj.dx / 2;
	y = mapobj.dy * row + mapobj.dy / 2;
	if (isCellDown(mapobj, col, row)) {
	    y += mapobj.dy / 2;
	}
	return [x, y];
    }

    function hexagon(radius) {
	// Returns a list of coordinates [x, y] representing a hexagon
	// path starting with the left vertex, going clockwise, ending
	// once again on the left vertex.
	//
	// The first coordinate returned is a relative movement from
	// the center of the hex, the remaining coordinates are
	// relative to the previous point.
	//
	// Example usage in an SVG path:
	//     "m" + hexagon(30).join("l")
	// draws a hexagon with the center of the hex set where the
	// pointer originally started.

	// Origin point for each relative coordinate.
	var x0 = 0, y0 = 0;
	return hexbinAngles.map(
	    function(angle) {
		var x1 = Math.sin(angle) * radius;
		var y1 = -Math.cos(angle) * radius;
		// TODO: avoid e notation ("1.3e-16" for 0) - use .toFixed(10)
		var coord = [x1-x0, y1-y0];
		x0 = x1;  // Next coord is relative to this one.
		y0 = y1;
		return coord;
	    }
	);
    }

    return {
	Hexmap: Hexmap,
	calculateCenter: calculateCenter
    };
})();

// exports: Hexmap
