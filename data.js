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
addSystem("Mapiikhaar", 16, 14, href=systemHref("Mapiikhaar"))
    .setDescription(
	"Pre-Imperial research station. We got data for it from Iraar Lar."
    );
addSystem("Iishmarmep", 16, 16);
addSystem("Riimishkin", 16, 21);

addSystem("Hasaggan", 17, 11);
addSystem("Gipuurkhir", 17, 13);
addSystem("Kuuhuurga", 17, 17);
addSystem("Forquee", 17, 19, href=systemHref("Forquee"))
    .setDescription(
	"&ldquo;Leave Forquee alone!&rdquo; Learned Karma techniques " +
	"(e.g. purging Fury) from the aliens(Droyne?). Flying domed " +
	"city. Under Virus attack when we left."
    );
addSystem("Kemkeaanguu", 17, 21);

addSystem("Did", 18, 13, href=systemHref("Did"))
    .setDescription(
	"Message to deliver from Imperial Office of Calendar " +
	"Compliance. 10 MCr reward!"
    );
addSystem("Arlur", 18, 14);
addSystem("Uure", 18, 18, href=systemHref("Uure"))
    .setDescription(
	"Father's Lodge. Ancient crash site for Imperial archaeological " +
	"support ship. Our first lesson on Karma, Madness, and Fury.<p>" +
	"On our second pass through, Virus bombarded the archaeological " +
	"site, and the Lodge initiated a solar flare to destroy the " +
	"Virus fleet."
    );
addSystem("InmuuKi", 18, 20);

addSystem("Irshuushdaar", 19, 15, href=systemHref("Irshuushdaar"))
    .setDescription(
	"Where the space wreck was sent to jump to, presumably by the " +
	"Marquis of Rohintash's fury infused ally."
    );
addSystem("Muukher", 19, 16);
addSystem("Irdar Ga", 19, 17, href=systemHref("Irdar_Ga"))
    .setDescription(
	"Ships that go here don't come back, because they're eaten " +
	"by nanites. The nanites are building (have built?) something."
    );
addSystem("Vlair", 19, 18, href=systemHref("Vlair"))
    .setDescription(
	"First time in system: Storm, Omar Factors<p>" +
	"Second time in system: Mine of madness and sarlacc maw"
    );
addSystem("Ziger", 19, 21);

addSystem("Gier Iir", 20, 13);
addSystem("Gimi Kuuid", 20, 17, href=systemHref("Gimi_Kuuid"))
    .setDescription(
	"Underwater spherical displacement &mdash; signs of alternate 'madness' universe with dark changes (dictator vs. administrator, etc.).<p>" +
	"Gained hexagon key in a pawn shop here.<p>" +
	"Revolution underway on our way back through here on [date]. Virus is also in-system since [date].<p>" +
	"One of the planets hosting a Galactic Traveler office."
    );
addSystem("Garuu Uurges", 20, 18);
addSystem("Daaruugka", 20, 19);

addSystem("Girgulash", 21, 16, href=systemHref("Girgulash"))
    .setDescription(
	"Trango is a moon of Girgulash, home of Trango shipyards, " +
	"headed by Messorius Thraxton. Thraines, a city on Girgulash " +
	"proper, hosted an Imperial Archive. <p>This is where we " +
	"found the message for the Office of Calendar Compliance " +
	"on Did.<p>First encounter with wireheads; they bombed a " +
	"dome on Trango."
    );
addSystem("Khida", 21, 18, href=systemHref("Khida"))
    .setDescription(
	"Stefan, Kyle Vesta, and Dr. Denmark are from here.<p>" +
	"Dr. Denmark was kidnapped here, kicking off our group's " +
	"association with him.<p>" +
	"Khida Secundus Defensive Facility, Grandma Vesta, Ling " +
	"Standard Products<p>" +
	"The last time we were here, a 'bone' ship (Madness?) jumped " +
	"in, and we helped destroy it."
);
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

getHex(19, 13).setName("black hole")
    .setDescription(
	"Imperial observatory with Gertie was programmed not to " +
	"be able to look at this parsec."
    ).suppressPlanet = true;

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
