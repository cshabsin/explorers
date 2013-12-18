// TODO: figure out how to import this from hex.js instead. (goog.require?)
function Hex(c, r) {
    this.c = c;
    this.r = r;
    this.name = "";
    this.href = null;
}

Hex.prototype.getCol = function() { return this.c; };
Hex.prototype.getRow = function() { return this.r; };
Hex.prototype.getName = function() { return this.name; };
Hex.prototype.getHref = function() { return this.href; };
Hex.prototype.getDisplayCoord = function() {
    dig = d3.format("02d");
    return dig(this.c + first_c) + dig(this.r + first_r);
};

Hex.prototype.setName = function(n) { this.name = n; return this; };
Hex.prototype.setHref = function(n) { this.href = n; return this; };

// Offsets for viewing
var first_r = 11;
var first_c = 16;

// Size of array
var rows = 13;
var cols = 10;

// Array of hexes
var hexArray = new Array(cols);
for (var i = 0; i < cols; i++) {
    hexArray[i] = new Array(rows);
    for (var j=0; j < rows; j++) {
	hexArray[i][j] = new Hex(i, j);
    }
}

getHex = function(view_row, view_col) {
    return hexArray[view_col - first_c][view_row - first_r];
};

// Hexes by name (for ease of use later).
hexes = {}

addSystem = function(name, col, row) {
    prop_name = name.replace(/\s+/g, "");
    hex = getHex(row, col);
    hexes[prop_name] = hex.setName(name);
    return hex;
};

addSystem("Terschaps", 16, 12);
addSystem("Mimmar Shari", 16, 13);
addSystem("Mapiikhaar", 16, 14).setHref("http://scripts.mit.edu/~ringrose/explorers/index.php?title=Mapiikhaar");
addSystem("Iishmarmep", 16, 16);
addSystem("Riimishkin", 16, 21);

addSystem("Hasaggan", 17, 11);
addSystem("Gipuurkhir", 17, 13);
addSystem("Kuuhuurga", 17, 17);
addSystem("Forquee", 17, 19).setHref("http://scripts.mit.edu/~ringrose/explorers/index.php?title=Forquee");
addSystem("Kemkeaanguu", 17, 21);

addSystem("Did", 18, 13).setHref("http://scripts.mit.edu/~ringrose/explorers/index.php?title=Did");
addSystem("Arlur", 18, 14);
addSystem("Uure", 18, 18).setHref("http://scripts.mit.edu/~ringrose/explorers/index.php?title=Uure");
addSystem("InmuuKi", 18, 20);

addSystem("Irshuushdaar", 19, 15).setHref("http://scripts.mit.edu/~ringrose/explorers/index.php?title=Irshuushdaar");
addSystem("Muukher", 19, 16);
addSystem("IrdarGa", 19, 17).setHref("http://scripts.mit.edu/~ringrose/explorers/index.php?title=Irdar_Ga");
addSystem("Vlair", 19, 18).setHref("http://scripts.mit.edu/~ringrose/explorers/index.php?title=Vlair");
addSystem("Ziger", 19, 21);

addSystem("Gier Iir", 20, 13);
addSystem("Gimi Kuuid", 20, 17).setHref("http://scripts.mit.edu/~ringrose/explorers/index.php?title=Gimi_Kuuid");
addSystem("Garuu Uurges", 20, 18);
addSystem("Daaruugka", 20, 19);

addSystem("Girgulash", 21, 16).setHref("http://scripts.mit.edu/~ringrose/explorers/index.php?title=Girgulash");
addSystem("Khida", 21, 18).setHref("http://scripts.mit.edu/~ringrose/explorers/index.php?title=Khida");
addSystem("Khui", 21, 19);

addSystem("Lis", 22, 11);
addSystem("Sham", 22, 12);
addSystem("Amem", 22, 13);
addSystem("Ugar", 22, 16).setHref("http://scripts.mit.edu/~ringrose/explorers/index.php?title=Ugar");
addSystem("Vlir", 22, 17).setHref("http://scripts.mit.edu/~ringrose/explorers/index.php?title=Vlir");
addSystem("Duuksha", 22, 20);

addSystem("Udipeni", 23, 16).setHref("http://scripts.mit.edu/~ringrose/explorers/index.php?title=Udipeni");
addSystem("Nagiluln", 23, 17).setHref("http://scripts.mit.edu/~ringrose/explorers/index.php?title=Nagilun");
addSystem("Kagershi", 23, 18).setHref("http://scripts.mit.edu/~ringrose/explorers/index.php?title=Kagershi");
addSystem("Gowandon", 23, 19).setHref("http://scripts.mit.edu/~ringrose/explorers/index.php?title=Gowandon");

addSystem("Uuduud", 24, 11);
addSystem("Uuruum", 24, 14);
addSystem("Irar Lar", 24, 17).setHref("http://scripts.mit.edu/~ringrose/explorers/index.php?title=Irar_Lar");
addSystem("Kuundin", 24, 18).setHref("http://scripts.mit.edu/~ringrose/explorers/index.php?title=Kuundin");
addSystem("Kamar Inag", 24, 20);
addSystem("Duumar Di", 24, 21);

addSystem("Uumbuu", 25, 12);
addSystem("Ervlan", 25, 13);
addSystem("Gaiid", 25, 14);
addSystem("Digapir", 25, 16);
addSystem("Shiirla", 25, 19);
addSystem("Dinkhaluurk", 25, 21);

var radius = 70;
var hexbin = d3.rhexbin().radius(radius);
hexbin.size([cols * hexbin.dx(), rows * hexbin.dy()]);

var mapdiv = d3.select("#map");
var svg = mapdiv.append("svg").
    attr("height", rows*radius*2).
    attr("width", cols*radius*2);

var centers = hexbin.centers();
centers.forEach(function(center) {
    effective_i = center.i - 1;
    effective_j = center.j - 1;
    center.hex = null;
    center.href = null;
    center.name = "";
    if (effective_i >= 0 && effective_i < hexArray.length &&
	effective_j >= 0 && effective_j < hexArray[0].length) {
	center.hex = hexArray[effective_i][effective_j];
	center.href = center.hex.getHref();
	center.name = center.hex.getName() || center.hex.getDisplayCoord();
    }
});

var g = svg.append("g").
    attr("transform", "translate(" + (1-radius/2) + "," + (10-radius) + ")").
    attr("class", "map-anchor-group");
g.append("path").
    attr("stroke", "#60a").
    attr("fill", "none").
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
    attr("x", 0).
    attr("y", 50).
    style("text-anchor", "middle").
    attr("font-size", "60%").
    attr("class", "map-coord").
    text(function(d) { if (d.hex) { return d.hex.getDisplayCoord(); } });

var hexesWithSystems = hexElems.filter(function(d) { if (d.hex && d.hex.getName()) { return d; } });
hexesWithSystems.append("text").
    attr("x", 0).
    attr("y", 20).
    style("text-anchor", "middle").
    attr("font-size", "80%").
    attr("class", function(d) { 
	if (d.hex && d.hex.getHref()) {
	    return "map-name-link";
	} else {
	    return "map-name";
	}
    }).
    text(function(d) { if (d.hex && d.hex.getName()) { return d.hex.getName(); } });
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
