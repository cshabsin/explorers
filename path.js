function makeSpinyRatPathArray() {
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

    function shipTraversal(sourceHex, sourceOffset, destinationHex,
			   destinationOffset) {
	return [pointRel(sourceHex, sourceOffset), 
		pointRel(destinationHex, destinationOffset)];
    }

    spinyRatPath = [];
    spinyRatPath.push(shipTraversal(hexes.Khida, dir.W,
				    hexes.GimiKuuid, dir.SE));
    spinyRatPath.push(shipTraversal(hexes.GimiKuuid, dir.SW,
				    hexes.Vlair, dir.SE));
    spinyRatPath.push(shipTraversal(hexes.Vlair, dir.SW, hexes.Uure, dir.SE));
    spinyRatPath.push(shipTraversal(hexes.Uure, dir.SW, hexes.Forquee, dir.SE));
    spinyRatPath.push(shipTraversal(hexes.Forquee, dir.NE, hexes.Uure, dir.NW));
    spinyRatPath.push(shipTraversal(hexes.Uure, dir.NE, hexes.Vlair, dir.NW));
    spinyRatPath.push(shipTraversal(hexes.Vlair, dir.NE,
				    hexes.GimiKuuid, dir.NW));
    spinyRatPath.push(shipTraversal(hexes.GimiKuuid, dir.NE,
				    hexes.Khida, dir.NW));
    spinyRatPath.push(shipTraversal(hexes.Khida, dir.N, hexes.Vlir, dir.W));
    spinyRatPath.push(shipTraversal(hexes.Vlir, dir.N, hexes.Nagilun, dir.NW));
    spinyRatPath.push(shipTraversal(hexes.Nagilun, dir.N, hexes.Udipeni, dir.S));
    spinyRatPath.push(shipTraversal(hexes.Udipeni, dir.W, hexes.Ugar, dir.N));
    spinyRatPath.push(shipTraversal(hexes.Ugar, dir.NW,
				    hexes.Girgulash, dir.NE));
    spinyRatPath.push(shipTraversal(hexes.Girgulash, dir.SE,
				    hexes.Ugar, dir.SW));
    spinyRatPath.push(shipTraversal(hexes.Ugar, dir.S, hexes.Nagilun, dir.SW));
    spinyRatPath.push(shipTraversal(hexes.Nagilun, dir.S,
				    hexes.Kagershi, dir.N));
    spinyRatPath.push(shipTraversal(hexes.Kagershi, dir.S,
				    hexes.Gowandon, dir.N));
    spinyRatPath.push(shipTraversal(hexes.Gowandon, dir.NE,
				    hexes.Kuundin, dir.W));
    spinyRatPath.push(shipTraversal(hexes.Kuundin, dir.N,
				    hexes.IrarLar, dir.S));
    
    return spinyRatPath;
}
