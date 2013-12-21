// Copyright (C) 2013 Chris Shabsin

var mapdiv = d3.select("#map");
a = createMap(mapdiv, hexArray);
svg = a[0];
map = a[1];

function pointRel(hex, offset) {
    if (hex.center == null) {
	alert("No center for hex " + hex.name);
    }
    return [hex.center[0] + offset[0], hex.center[1] + offset[1]];
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

// NOTE: Has to be done after createMap, since it is what sets centers
// on hexes. Move center generation to data?
function shipTraversal(sourceHex, sourceOffset, destinationHex, destinationOffset) {
    return [pointRel(sourceHex, sourceOffset), 
	    pointRel(destinationHex, destinationOffset)];
}

spinyRatPath = [];
spinyRatPath.push(shipTraversal(hexes.Khida, dir.W, hexes.GimiKuuid, dir.SE));
spinyRatPath.push(shipTraversal(hexes.GimiKuuid, dir.SW, hexes.Vlair, dir.SE));
spinyRatPath.push(shipTraversal(hexes.Vlair, dir.SW, hexes.Uure, dir.SE));
spinyRatPath.push(shipTraversal(hexes.Uure, dir.SW, hexes.Forquee, dir.SE));

// for (var i = 0; i<spinyRatPath.length; i++) {
//     var curpath = spinyRatPath[i];
//     map.append("path").
// 	attr("d", "M" + curpath[0] + "L" + curpath[1] + "z").
// 	attr("class", "spiny-rat-path").
// 	attr("stroke", "white").
// 	attr("fill", "none");
// }
