// Copyright (C) 2013 Chris Shabsin

// Offsets for viewing
var first_r = 11;
var first_c = 16;

// Size of array
var rows = 11;
var cols = 10;

// Array of hexes
var hexArray = new Array(cols);
for (var i = 0; i < cols; i++) {
    hexArray[i] = new Array(rows);
    for (var j=0; j < rows; j++) {
	hexArray[i][j] = new Hex(i, j);
    }
}

getHex = function(view_col, view_row) {
    return hexArray[view_col - first_c][view_row - first_r];
};

// Hexes by name (for ease of use later).
hexes = {}

function addSystem(name, col, row, href) {
    prop_name = name.replace(/\s+/g, "");
    hex = getHex(col, row);
    hexes[prop_name] = hex.setName(name).setHref(href);
    return hex;
}

function systemHref(sys_short_name) {
    return "http://scripts.mit.edu/~ringrose/explorers/index.php?title=" +
	sys_short_name;
}

addSystem("Terschaps", 16, 12);
addSystem("Mimmar Shari", 16, 13);
addSystem("Mapiikhaar", 16, 14, href=systemHref("Mapiikhaar"));
addSystem("Iishmarmep", 16, 16);
addSystem("Riimishkin", 16, 21);

addSystem("Hasaggan", 17, 11);
addSystem("Gipuurkhir", 17, 13);
addSystem("Kuuhuurga", 17, 17);
addSystem("Forquee", 17, 19, href=systemHref("Forquee"));
addSystem("Kemkeaanguu", 17, 21);

addSystem("Did", 18, 13, href=systemHref("Did"));
addSystem("Arlur", 18, 14);
addSystem("Uure", 18, 18, href=systemHref("Uure"));
addSystem("InmuuKi", 18, 20);

addSystem("Irshuushdaar", 19, 15, href=systemHref("Irshuushdaar"));
addSystem("Muukher", 19, 16);
addSystem("Irdar Ga", 19, 17, href=systemHref("Irdar_Ga"));
addSystem("Vlair", 19, 18, href=systemHref("Vlair"));
addSystem("Ziger", 19, 21);

addSystem("Gier Iir", 20, 13);
addSystem("Gimi Kuuid", 20, 17, href=systemHref("Gimi_Kuuid"));
addSystem("Garuu Uurges", 20, 18);
addSystem("Daaruugka", 20, 19);

addSystem("Girgulash", 21, 16, href=systemHref("Girgulash"));
addSystem("Khida", 21, 18, href=systemHref("Khida"));
addSystem("Khui", 21, 19);

addSystem("Lis", 22, 11);
addSystem("Sham", 22, 12);
addSystem("Amem", 22, 13);
addSystem("Ugar", 22, 16, href=systemHref("Ugar"));
addSystem("Vlir", 22, 17, href=systemHref("Vlir"));
addSystem("Duuksha", 22, 20);

addSystem("Udipeni", 23, 16, href=systemHref("Udipeni"));
addSystem("Nagilun", 23, 17, href=systemHref("Nagilun"));
addSystem("Kagershi", 23, 18, href=systemHref("Kagershi"));
addSystem("Gowandon", 23, 19, href=systemHref("Gowandon"));

addSystem("Uuduud", 24, 11);
addSystem("Uuruum", 24, 14);
addSystem("Irar Lar", 24, 17, href=systemHref("Irar_Lar"));
addSystem("Kuundin", 24, 18, href=systemHref("Kuundin"));
addSystem("Kamar Inag", 24, 20);
addSystem("Duumar Di", 24, 21);

addSystem("Uumbuu", 25, 12);
addSystem("Ervlan", 25, 13);
addSystem("Gaiid", 25, 14);
addSystem("Digapir", 25, 16);
addSystem("Shiirla", 25, 19);
addSystem("Dinkhaluurk", 25, 21);

getHex(19, 13).setName("black hole").suppressPlanet = true;

spinyRatPath = [];
spinyRatPath.push(new path.PathSegment(hexes.Khida, [-10, -4],
				       hexes.GimiKuuid, [0, 32]));
spinyRatPath.push(new path.PathSegment(hexes.GimiKuuid, [0, 32],
				       hexes.Vlair, [0, -12]));
spinyRatPath.push(new path.PathSegment(hexes.Vlair, [0, -12],
				       hexes.Uure, [0, -12]));
spinyRatPath.push(new path.PathSegment(hexes.Uure, [0, -12],
				       hexes.Forquee, [0, -12]));
spinyRatPath.push(new path.PathSegment(hexes.Forquee, [0, -12],
				       hexes.Uure, [-20, -20]));
spinyRatPath.push(new path.PathSegment(hexes.Uure, [-20, -20],
				       hexes.Vlair, [0, -35]));
spinyRatPath.push(new path.PathSegment(hexes.Vlair, [0, -35],
				       hexes.GimiKuuid, [-5, -15]));
spinyRatPath.push(new path.PathSegment(hexes.GimiKuuid, [-5, -15],
				       hexes.Khida, [0, -20]));
spinyRatPath.push(new path.PathSegment(hexes.Khida, [0, -20],
				       hexes.Vlir, [0, -20]));
spinyRatPath.push(new path.PathSegment(hexes.Vlir, [0, -20],
				       hexes.Nagilun, [0, -20]));
spinyRatPath.push(new path.PathSegment(hexes.Nagilun, [0, -20],
				       hexes.Udipeni, [-23, 23]));
spinyRatPath.push(new path.PathSegment(hexes.Udipeni, [-23, 23],
				       hexes.Ugar, [0, -10]));
spinyRatPath.push(new path.PathSegment(hexes.Ugar, [0, -10],
				       hexes.Girgulash, [25, 0]));
spinyRatPath.push(new path.PathSegment(hexes.Girgulash, [25, 0],
				       hexes.Ugar, [-15, 30]));
spinyRatPath.push(new path.PathSegment(hexes.Ugar, [-15, 30],
				       hexes.Nagilun, [-10, 5]));
spinyRatPath.push(new path.PathSegment(hexes.Nagilun, [-10, 5],
				       hexes.Kagershi, [-10, 0]));
spinyRatPath.push(new path.PathSegment(hexes.Kagershi, [-10, 0],
				       hexes.Gowandon, [-10, -10]));
spinyRatPath.push(new path.PathSegment(hexes.Gowandon, [-10, -10],
				       hexes.Kuundin, [-10, 0]));
spinyRatPath.push(new path.PathSegment(hexes.Kuundin, [-10, 0],
				       hexes.IrarLar, [-10, 0]));
spinyRatPath.push(new path.PathSegment(hexes.IrarLar, [-10, 0],
				       hexes.Nagilun, [20, 0]));

// exports: hexes, hexArray, spinyRatPath
