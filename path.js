path = (function makeSpinyRatPathArray() {
    // NOTE: Has to be done after createMap, since it is what sets centers
    // on hexes. Move center generation to data? 
    
    function pointRel(hex, offset) {
	if (hex.cell == null) {
	    alert("No center for hex " + hex.name);
	}
	return [hex.cell.center[0] + offset[0], hex.cell.center[1] + offset[1]];
    }

    dir = {}
    dir.NW = [-5, -5];
    dir.N = [0, -8];
    dir.NE = [5, -5];
    dir.E = [8, 0];
    dir.SE = [5, 5];
    dir.S = [0, 8];
    dir.SW = [-5, 5];
    dir.W = [-8, 0];

    function PathSegment(sourceHex, sourceOffset, destinationHex,
			 destinationOffset) {
	this.sourceHex = sourceHex;
	this.sourceOffset = sourceOffset;
	this.destinationHex = destinationHex;
	this.destinationOffset = destinationOffset;
    }

    PathSegment.prototype.getPoints = function() {
	return [pointRel(this.sourceHex, this.sourceOffset), 
		pointRel(this.destinationHex, this.destinationOffset)];
    }

    return {
	pointRel: pointRel,
	dir: dir,
	PathSegment: PathSegment,
    };
})();
