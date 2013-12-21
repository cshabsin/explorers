// Copyright (C) 2013 Chris Shabsin

var mapdiv = d3.select("#map");

settings_div = mapdiv.append("div");
checkbox = settings_div.append("input").attr("type", "checkbox").attr("class", "map-setting");
settings_div.append("label").text("The path of the Spiny Rat").attr("style", "color:white");

checkbox.on("change", function() {
    isChecked = this.checked;
    for (var i = 0; i<spinyRatPathElems.length; i++) {
	spinyRatPathElems[i].attr("class", isChecked ? "spiny-rat" : "spiny-rat-invis");
    }
});

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
spinyRatPath.push(shipTraversal(hexes.Forquee, dir.NE, hexes.Uure, dir.NW));
spinyRatPath.push(shipTraversal(hexes.Uure, dir.NE, hexes.Vlair, dir.NW));
spinyRatPath.push(shipTraversal(hexes.Vlair, dir.NE, hexes.GimiKuuid, dir.NW));
spinyRatPath.push(shipTraversal(hexes.GimiKuuid, dir.NE, hexes.Khida, dir.NW));
spinyRatPath.push(shipTraversal(hexes.Khida, dir.N, hexes.Vlir, dir.W));
spinyRatPath.push(shipTraversal(hexes.Vlir, dir.N, hexes.Nagilun, dir.NW));
spinyRatPath.push(shipTraversal(hexes.Nagilun, dir.N, hexes.Udipeni, dir.S));
spinyRatPath.push(shipTraversal(hexes.Udipeni, dir.W, hexes.Ugar, dir.N));
spinyRatPath.push(shipTraversal(hexes.Ugar, dir.NW, hexes.Girgulash, dir.NE));
spinyRatPath.push(shipTraversal(hexes.Girgulash, dir.SE, hexes.Ugar, dir.SW));
spinyRatPath.push(shipTraversal(hexes.Ugar, dir.S, hexes.Nagilun, dir.SW));
spinyRatPath.push(shipTraversal(hexes.Nagilun, dir.S, hexes.Kagershi, dir.N));
spinyRatPath.push(shipTraversal(hexes.Kagershi, dir.S, hexes.Gowandon, dir.N));
spinyRatPath.push(shipTraversal(hexes.Gowandon, dir.NE, hexes.Kuundin, dir.W));
spinyRatPath.push(shipTraversal(hexes.Kuundin, dir.N, hexes.IrarLar, dir.S));

spinyRatPathElems = []

for (var i = 0; i<spinyRatPath.length; i++) {
    var curpath = spinyRatPath[i];
    spinyRatPathElems.push(map.append("path").
	attr("d", "M" + curpath[0] + "L" + curpath[1] + "z").
			   attr("class", "spiny-rat-invis"));
}
