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
	hexArray[i][j] = new model.Hex(i, j);
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
    hexes[prop_name] = hex.name(name).href(href);
    return hex;
}

function systemHref(sys_short_name) {
    return "http://scripts.mit.edu/~ringrose/explorers/index.php?title=" +
	sys_short_name;
}

addSystem("Terschaps", 16, 12);
addSystem("Mimmar Shari", 16, 13);
addSystem("Mapiikhaar", 16, 14, href=systemHref("Mapiikhaar"))
    .description(
	"Pre-Imperial research station. We got data for it from Iraar Lar."
    );
addSystem("Iishmarmep", 16, 16);
addSystem("Riimishkin", 16, 21);

addSystem("Hasaggan", 17, 11);
addSystem("Gipuurkhir", 17, 13);
addSystem("Kuuhuurga", 17, 17);
addSystem("Forquee", 17, 19, href=systemHref("Forquee"))
    .description(
	"&ldquo;Leave Forquee alone!&rdquo; Learned Karma techniques " +
	"(e.g. purging Fury) from the aliens(Droyne?). Flying domed " +
	"city. Under Virus attack when we left."
    );
addSystem("Kemkeaanguu", 17, 21);

addSystem("Did", 18, 13, href=systemHref("Did"))
    .description(
	"Message to deliver from Imperial Office of Calendar " +
	"Compliance. 10 MCr reward!"
    );
addSystem("Arlur", 18, 14);
addSystem("Uure", 18, 18, href=systemHref("Uure"))
    .description(
	"Father's Lodge. Ancient crash site for Imperial archaeological " +
	"support ship. Our first lesson on Karma, Madness, and Fury.<p>" +
	"On our second pass through, Virus bombarded the archaeological " +
	"site, and the Lodge initiated a solar flare to destroy the " +
	"Virus fleet."
    );
addSystem("InmuuKi", 18, 20);

addSystem("Irshuushdaar", 19, 15, href=systemHref("Irshuushdaar"))
    .description(
	"Where the space wreck was sent to jump to, presumably by the " +
	"Marquis of Rohintash's fury infused ally."
    );
addSystem("Muukher", 19, 16);
addSystem("Irdar Ga", 19, 17, href=systemHref("Irdar_Ga"))
    .description(
	"Ships that go here don't come back, because they're eaten " +
	"by nanites. The nanites are building (have built?) something."
    );
addSystem("Vlair", 19, 18, href=systemHref("Vlair"))
    .description(
	"First time in system: Storm, Omar Factors<p>" +
	"Second time in system: Mine of madness and sarlacc maw"
    );
addSystem("Ziger", 19, 21);

addSystem("Gier Iir", 20, 13);
addSystem("Gimi Kuuid", 20, 17, href=systemHref("Gimi_Kuuid"))
    .description(
	"Underwater spherical displacement &mdash; signs of alternate 'madness' universe with dark changes (dictator vs. administrator, etc.).<p>" +
	"Gained hexagon key in a pawn shop here.<p>" +
	"Revolution underway on our way back through here on [date]. Virus is also in-system since [date].<p>" +
	"One of the planets hosting a Galactic Traveler office."
    );
addSystem("Garuu Uurges", 20, 18);
addSystem("Daaruugka", 20, 19);

addSystem("Girgulash", 21, 16, href=systemHref("Girgulash"))
    .description(
	"Trango is a moon of Girgulash, home of Trango shipyards, " +
	"headed by Messorius Thraxton. Thraines, a city on Girgulash " +
	"proper, hosted an Imperial Archive. <p>This is where we " +
	"found the message for the Office of Calendar Compliance " +
	"on Did.<p>First encounter with wireheads; they bombed a " +
	"dome on Trango. Also, our first encounter with old " +
	"Imperial computers that seemed to recognize Stefan as someone " +
	"called Admiral Rogers."
    );
addSystem("Khida", 21, 18, href=systemHref("Khida"))
    .description(
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
addSystem("Ugar", 22, 16, href=systemHref("Ugar"))
    .description(
	"Puddle of blood, murder mystery. Cetagandan/tainted " +
	"money plot. On return (15th system): Mr. Data?"
    );
addSystem("Vlir", 22, 17, href=systemHref("Vlir"))
    .description(
	"Western town with the tainted money. Earned favors from the " +
	"Tong (Star Tong?) - Stefan can ask questions where there are " +
	"contacts."
    );
addSystem("Duuksha", 22, 20);

addSystem("Udipeni", 23, 16, href=systemHref("Udipeni"))
    .description(
	"Home of Threnody and Max.<p>Bottom cult is taking hold, though " +
	"the military is resistant and Max's efforts last time through " +
	"may have helped. <p>Signs of anagathics use (and possible " +
	"withdrawl) by government officials. <p>" +
	"Found the [steampunk computer] in an old Imperium Library."
    );
addSystem("Nagilun", 23, 17, href=systemHref("Nagilun"))
    .description(
	"Home of Marian Dove.<p>" +
	"Thressalar - Museum attack, underground facility with ancient " +
	"computer, weird vines and grey goo.<p>" +
	"Kurnak, neighboring nation, has a negative tariff and embeds " +
	"surveillance nanites in all cargoes that pass through.<p>" +
	"Doctor Swede (who looks just like Doc Denmark) performed much " +
	"of the terraforming of New Nagilun. New Nagilun still has a low-" +
	"level poisonous biosphere and lethal wildlife. Screechers keep " +
	"wildlife away.<p>Most recent visit: asteroid with strange " +
	"physical properties (gravity distortions?) on collision course " +
	"with planet. Rescued researcher from kidnappers and took him " +
	"to space to help enter the asteroid and determine what to do. " +
	"Raced Cerberus there, and won."
    );
addSystem("Kagershi", 23, 18, href=systemHref("Kagershi"))
    .description(
	"Cerberus has a base set up here, taking over the system. " +
	"Staging ground for massive Cerberus fleet, but we managed to " +
	"sabotage their fuel supply, making it just impure enough to be " +
	"incompatible with their jump stabilizers.<p>In an old mining " +
	"facility contested by Cerberus and Virus-controlled robots, " +
	"we managed to sneak in and obtain an anomalous sphere of jump " +
	"space contained in real space, contained by a lanthanum ring. " +
	"This is one of the pieces we need to collect before facing the " +
	"Fracture."
    );
addSystem("Gowandon", 23, 19, href=systemHref("Gowandon"))
    .description(
	"Cerberus headquarters. Also, Ling Standard Products is " +
	"headquartered at Rhona Minor. LSP runs mining operations in " +
	"the ring, essentially using independent miners in indentured " +
	"servitude. We rescued numerous Aivar from this system.<p>" +
	"On Gowandon proper, we " +
	"explored an underwater arcology and found the Deeps, who " +
	"were especially affected by the virus ravaging the planet. " +
	"We managed to develop a cure to the virus using " +
	"Imperial-quality lab facilities, even as " +
	"the arcology itself tried to launch itself into orbit.<p>" +
	"Met up with some of Admiral Rogers (head of the " +
	"&ldquo;wizards&rdquo;) minions, and they spilled some info on " +
	"their long-term strategy.<p>Imperial Scout base also granted " +
	"us access on the strength of Stefan's identity as Admiral " +
	"Rogers. Gained more background and a skill point."
    );

addSystem("Uuduud", 24, 11);
addSystem("Uuruum", 24, 14);
addSystem("Irar Lar", 24, 17, href=systemHref("Irar_Lar"))
    .description(
	"The face in Threnody's photos turn out to be an ancient " +
	"installation where Father is fighting off Virus. We managed to " +
	"hook up with the friendly half of the installation and make our " +
	"way through to the data room, where Father was able to deliver " +
	"various data and useful tech for us. As we escaped, Father " +
	"blew the installation, and the whole planet. We had a LSP " +
	"observer along on our visit, their IT guy. It's unclear how " +
	"complete his report will be to them.<p>" +
	"Mary (Marian's doppelganger) went to Irar Lar on the Long " +
	"Shot to look for clues to where the Fracture will be."
    );
addSystem("Kuundin", 24, 18, href=systemHref("Kuundin"))
    .description(
	"According to the logs from the Corona, this is where " +
	"Anagathics come from. We found a lab ship and boarded it, " +
	"discovering that things had gone terribly wrong. We found " +
	"formulas for variants on Anagathics, but all the formulas " +
	"depend on a &ldquo;precursor&rdquo; compound that we have " +
	"no supply of.<p>" +
	"Next, we visited the planet itself, where we discovered that " +
	"the Droyne of the planet had ascended to become a planet-" +
	"wide spirit that protects the native populace.<p>" +
	"The <em>Fruitful Discovery</em>, a LSP science vessel, " +
	"jumped in and approached the planet to refuel and experiment " +
	"on the locals. We got them off the planet, then protected them " +
	"from the Virus ship that jumped into the system. We agreed to " +
	"coordinate our jumps to Irar Lar, which was both our next " +
	"destination."
    );
addSystem("Kamar Inag", 24, 20);
addSystem("Duumar Di", 24, 21);

addSystem("Uumbuu", 25, 12);
addSystem("Ervlan", 25, 13);
addSystem("Gaiid", 25, 14);
addSystem("Digapir", 25, 16);
addSystem("Shiirla", 25, 19);
addSystem("Dinkhaluurk", 25, 21);

getHex(19, 13).name("black hole")
    .description(
	"Imperial observatory with Gertie was programmed not to " +
	"be able to look at this parsec."
    ).suppressPlanet = true;

spinyRatPath = [];
spinyRatPath.add = function(hex1, offset1, hex2, offset2) {
    var segment = new path.PathSegment(hex1, offset1, hex2, offset2);
    this.push(segment);
    return segment;
};
spinyRatPath.add(hexes.Khida, [-10, -4], hexes.GimiKuuid, [0, 32]);
spinyRatPath.add(hexes.GimiKuuid, [0, 32], hexes.Vlair, [0, -12]);
spinyRatPath.add(hexes.Vlair, [0, -12], hexes.Uure, [0, -12]);
spinyRatPath.add(hexes.Uure, [0, -12], hexes.Forquee, [0, -12]);
spinyRatPath.add(hexes.Forquee, [0, -12], hexes.Uure, [-20, -20]);
spinyRatPath.add(hexes.Uure, [-20, -20], hexes.Vlair, [0, -35]);
spinyRatPath.add(hexes.Vlair, [0, -35], hexes.GimiKuuid, [-5, -15]);
spinyRatPath.add(hexes.GimiKuuid, [-5, -15], hexes.Khida, [0, -20]);
spinyRatPath.add(hexes.Khida, [0, -20], hexes.Vlir, [0, -20]);
spinyRatPath.add(hexes.Vlir, [0, -20], hexes.Nagilun, [0, -20]);
spinyRatPath.add(hexes.Nagilun, [0, -20], hexes.Udipeni, [-23, 23]);
spinyRatPath.add(hexes.Udipeni, [-23, 23], hexes.Ugar, [0, -10]);
spinyRatPath.add(hexes.Ugar, [0, -10], hexes.Girgulash, [25, 0]);
spinyRatPath.add(hexes.Girgulash, [25, 0], hexes.Ugar, [-15, 30]);
spinyRatPath.add(hexes.Ugar, [-15, 30], hexes.Nagilun, [-10, 5]);
spinyRatPath.add(hexes.Nagilun, [-10, 5], hexes.Kagershi, [-10, 0]);
spinyRatPath.add(hexes.Kagershi, [-10, 0], hexes.Gowandon, [-10, -10]);
spinyRatPath.add(hexes.Gowandon, [-10, -10], hexes.Kuundin, [-10, 0]);
spinyRatPath.add(hexes.Kuundin, [-10, 0], hexes.IrarLar, [-10, 0]);
spinyRatPath.add(hexes.IrarLar, [-10, 0], hexes.Nagilun, [20, 0]);

// exports: hexes, hexArray, spinyRatPath
