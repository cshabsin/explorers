var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
System.register("model", [], function (exports_1, context_1) {
    "use strict";
    var Entity, Hex, PathSegment;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [],
        execute: function () {
            Entity = /** @class */ (function () {
                function Entity() {
                }
                // description() -> return the description.
                // description(desc) -> set the description, return the Entity.
                // TODO: split set vs. get functionality.
                Entity.prototype.description = function (desc) {
                    if (desc) {
                        this._description = desc;
                        return this;
                    }
                    return this._description;
                };
                // href() -> return the href.
                // href(desc) -> set the href, return the Entity.
                // TODO: split set vs. get functionality.
                Entity.prototype.href = function (href) {
                    if (href) {
                        this._href = href;
                        return this;
                    }
                    return this._href;
                };
                // Override to generate the appropriate verbose descriptive
                // text for the entity.
                Entity.prototype.makeDescription = function () {
                    return "Unimplemented.";
                };
                Entity.prototype.setHiliteCallback = function (cb) {
                    this._hiliteCallback = cb;
                };
                Entity.prototype.hilite = function (val) {
                    if (this._hiliteCallback) {
                        this._hiliteCallback(val);
                    }
                };
                Entity.prototype.toJson = function () {
                    return null;
                };
                return Entity;
            }());
            Hex = /** @class */ (function (_super) {
                __extends(Hex, _super);
                function Hex(c, r, first_c, first_r) {
                    var _this = _super.call(this) || this;
                    _this.c = c;
                    _this.r = r;
                    _this.first_c = first_c;
                    _this.first_r = first_r;
                    if (first_c == null) {
                        first_c = 0;
                    }
                    if (first_r == null) {
                        first_r = 0;
                    }
                    return _this;
                }
                Hex.prototype.col = function (c) {
                    if (c != null) {
                        this.c = c;
                        return this;
                    }
                    return this.c;
                };
                Hex.prototype.row = function (r) {
                    if (r != null) {
                        this.r = r;
                        return this;
                    }
                    return this.r;
                };
                Hex.prototype.name = function (n) {
                    if (n != null) {
                        this._name = n;
                        return this;
                    }
                    return this._name;
                };
                Hex.prototype.hasSystem = function () {
                    return !this._suppressPlanet && this._name != "";
                };
                Hex.prototype.getDisplayCoord = function () {
                    // TODO: generalize
                    function dig(n) {
                        if (n > 10) {
                            return String(n);
                        }
                        else {
                            return "0" + String(n);
                        }
                    }
                    return dig(this.c + this.first_c) + dig(this.r + this.first_r);
                };
                Hex.prototype.makeDescription = function () {
                    var rc = this.getDisplayCoord() + " - ";
                    if (this.href()) {
                        rc += "<a href='" + this.href() + "'>" + this.name() + "</a>";
                    }
                    else {
                        if (this.name()) {
                            rc += this.name();
                        }
                        else {
                            rc += "No system";
                        }
                    }
                    var desc = this.description();
                    if (desc) {
                        rc += "<p>" + desc;
                    }
                    return rc;
                };
                Hex.prototype.toJson = function () {
                    if (!this.name()) {
                        return null;
                    }
                    return {
                        col: this.col(),
                        row: this.row(),
                        name: this.name(),
                        href: this.href(),
                        description: this.description(),
                        hasSystem: this.hasSystem(),
                    };
                };
                return Hex;
            }(Entity));
            exports_1("Hex", Hex);
            PathSegment = /** @class */ (function (_super) {
                __extends(PathSegment, _super);
                function PathSegment(sourceHex, sourceOffset, destinationHex, destinationOffset) {
                    var _this = _super.call(this) || this;
                    _this.sourceHex = sourceHex;
                    _this.sourceOffset = sourceOffset;
                    _this.destinationHex = destinationHex;
                    _this.destinationOffset = destinationOffset;
                    return _this;
                }
                PathSegment.prototype.makeDescription = function () {
                    var desc = (this.sourceHex.name() + " -> " +
                        this.destinationHex.name());
                    if (this.description()) {
                        desc += "<p>" + this.description();
                    }
                    return desc;
                };
                PathSegment.prototype.toJson = function () {
                    return {
                        sourceHex: [this.sourceHex.col(), this.sourceHex.row()],
                        sourceOffset: this.sourceOffset,
                        destinationHex: [this.destinationHex.col(),
                            this.destinationHex.row()],
                        destinationOffset: this.destinationOffset,
                        href: this.href(),
                        description: this.description(),
                    };
                };
                return PathSegment;
            }(Entity));
            exports_1("PathSegment", PathSegment);
        }
    };
});
System.register("data", ["model"], function (exports_2, context_2) {
    "use strict";
    var model_1, first_r, first_c, rows, cols, hexArray, getHex, hexes, spinyRatPath, add;
    var __moduleName = context_2 && context_2.id;
    function addSystem(name, col, row, href) {
        var prop_name = name.replace(/\s+/g, "");
        var hex = getHex(col, row);
        hexes[prop_name] = hex.name(name).href(href);
        return hex;
    }
    function systemHref(sys_short_name) {
        return "http://scripts.mit.edu/~ringrose/explorers/index.php?title=" +
            sys_short_name;
    }
    return {
        setters: [
            function (model_1_1) {
                model_1 = model_1_1;
            }
        ],
        execute: function () {
            // Offsets for viewing
            exports_2("first_r", first_r = 11);
            exports_2("first_c", first_c = 16);
            // Size of array
            exports_2("rows", rows = 11);
            exports_2("cols", cols = 10);
            // Array of hexes
            exports_2("hexArray", hexArray = new Array(cols));
            for (var i = 0; i < cols; i++) {
                hexArray[i] = new Array(rows);
                for (var j = 0; j < rows; j++) {
                    hexArray[i][j] = new model_1.Hex(i, j, first_c, first_r);
                }
            }
            getHex = function (view_col, view_row) {
                return hexArray[view_col - first_c][view_row - first_r];
            };
            // Hexes by name (for ease of use later).
            hexes = {};
            addSystem("Terschaps", 16, 12);
            addSystem("Mimmar Shari", 16, 13);
            addSystem("Mapiikhaar", 16, 14, systemHref("Mapiikhaar"))
                .description("Pre-Imperial research station. We got data for it from Iraar Lar.");
            addSystem("Iishmarmep", 16, 16);
            addSystem("Riimishkin", 16, 21);
            addSystem("Hasaggan", 17, 11);
            addSystem("Gipuurkhir", 17, 13);
            addSystem("Kuuhuurga", 17, 17);
            addSystem("Forquee", 17, 19, systemHref("Forquee"))
                .description("&ldquo;Leave Forquee alone!&rdquo; Learned Karma techniques " +
                "(e.g. purging Fury) from the aliens(Droyne?). Flying domed " +
                "city. Under Virus attack when we left.");
            addSystem("Kemkeaanguu", 17, 21);
            addSystem("Did", 18, 13, systemHref("Did"))
                .description("Message to deliver from Imperial Office of Calendar " +
                "Compliance. 10 MCr reward!");
            addSystem("Arlur", 18, 14);
            addSystem("Uure", 18, 18, systemHref("Uure"))
                .description("Father's Lodge. Ancient crash site for Imperial archaeological " +
                "support ship. Our first lesson on Karma, Madness, and Fury.<p>" +
                "On our second pass through, Virus bombarded the archaeological " +
                "site, and the Lodge initiated a solar flare to destroy the " +
                "Virus fleet.");
            addSystem("InmuuKi", 18, 20);
            addSystem("Irshuushdaar", 19, 15, systemHref("Irshuushdaar"))
                .description("Where the space wreck was sent to jump to, presumably by the " +
                "Marquis of Rohintash's fury infused ally.");
            addSystem("Muukher", 19, 16);
            addSystem("Irdar Ga", 19, 17, systemHref("Irdar_Ga"))
                .description("Ships that go here don't come back, because they're eaten " +
                "by nanites. The nanites are building (have built?) something.");
            addSystem("Vlair", 19, 18, systemHref("Vlair"))
                .description("First time in system: Storm, Omar Factors<p>" +
                "Second time in system: Mine of madness and sarlacc maw");
            addSystem("Ziger", 19, 21);
            addSystem("Gier Iir", 20, 13);
            addSystem("Gimi Kuuid", 20, 17, systemHref("Gimi_Kuuid"))
                .description("Underwater spherical displacement &mdash; signs of alternate 'madness' universe with dark changes (dictator vs. administrator, etc.).<p>" +
                "Gained hexagon key in a pawn shop here.<p>" +
                "Revolution underway on our way back through here on [date]. Virus is also in-system since [date].<p>" +
                "One of the planets hosting a Galactic Traveler office.");
            addSystem("Garuu Uurges", 20, 18);
            addSystem("Daaruugka", 20, 19);
            addSystem("Girgulash", 21, 16, systemHref("Girgulash"))
                .description("Trango is a moon of Girgulash, home of Trango shipyards, " +
                "headed by Messorius Thraxton. Thraines, a city on Girgulash " +
                "proper, hosted an Imperial Archive. <p>This is where we " +
                "found the message for the Office of Calendar Compliance " +
                "on Did.<p>First encounter with wireheads; they bombed a " +
                "dome on Trango. Also, our first encounter with old " +
                "Imperial computers that seemed to recognize Stefan as someone " +
                "called Admiral Rogers.");
            addSystem("Khida", 21, 18, systemHref("Khida"))
                .description("Stefan, Kyle Vesta, and Dr. Denmark are from here.<p>" +
                "Dr. Denmark was kidnapped here, kicking off our group's " +
                "association with him.<p>" +
                "Khida Secundus Defensive Facility, Grandma Vesta, Ling " +
                "Standard Products<p>" +
                "The last time we were here, a 'bone' ship (Madness?) jumped " +
                "in, and we helped destroy it.");
            addSystem("Khui", 21, 19);
            addSystem("Lis", 22, 11);
            addSystem("Sham", 22, 12);
            addSystem("Amem", 22, 13);
            addSystem("Ugar", 22, 16, systemHref("Ugar"))
                .description("Puddle of blood, murder mystery. Cetagandan/tainted " +
                "money plot. On return (15th system): Mr. Data?");
            addSystem("Vlir", 22, 17, systemHref("Vlir"))
                .description("Western town with the tainted money. Earned favors from the " +
                "Tong (Star Tong?) - Stefan can ask questions where there are " +
                "contacts.");
            addSystem("Duuksha", 22, 20);
            addSystem("Udipeni", 23, 16, systemHref("Udipeni"))
                .description("Home of Threnody and Max.<p>Bottom cult is taking hold, though " +
                "the military is resistant and Max's efforts last time through " +
                "may have helped. <p>Signs of anagathics use (and possible " +
                "withdrawl) by government officials. <p>" +
                "Found the [steampunk computer] in an old Imperium Library.");
            addSystem("Nagilun", 23, 17, systemHref("Nagilun"))
                .description("Home of Marian Dove.<p>" +
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
                "Raced Cerberus there, and won.");
            addSystem("Kagershi", 23, 18, systemHref("Kagershi"))
                .description("Cerberus has a base set up here, taking over the system. " +
                "Staging ground for massive Cerberus fleet, but we managed to " +
                "sabotage their fuel supply, making it just impure enough to be " +
                "incompatible with their jump stabilizers.<p>In an old mining " +
                "facility contested by Cerberus and Virus-controlled robots, " +
                "we managed to sneak in and obtain an anomalous sphere of jump " +
                "space contained in real space, contained by a lanthanum ring. " +
                "This is one of the pieces we need to collect before facing the " +
                "Fracture.");
            addSystem("Gowandon", 23, 19, systemHref("Gowandon"))
                .description("Cerberus headquarters. Also, Ling Standard Products is " +
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
                "Rogers. Gained more background and a skill point.");
            addSystem("Uuduud", 24, 11);
            addSystem("Uuruum", 24, 14);
            addSystem("Irar Lar", 24, 17, systemHref("Irar_Lar"))
                .description("The face in Threnody's photos turn out to be Father's " +
                "Observatory, where Father is fighting off Virus. We managed to " +
                "hook up with the friendly half of the installation and make our " +
                "way through to the data room, where Father was able to deliver " +
                "various data and useful tech for us. As we escaped, Father " +
                "blew the installation, and <a href=\"" +
                "http://digitalblasphemy.com/cgi-bin/mobilev.cgi?i=aftermath2k141&r=640x480" +
                "\">the whole planet</a>. We had a LSP " +
                "observer along on our visit, their IT guy. It's unclear how " +
                "complete his report will be to them.<p>" +
                "Mary (Marian's doppelganger) went to Irar Lar on the Long " +
                "Shot to look for clues to where the Fracture will be.");
            addSystem("Kuundin", 24, 18, systemHref("Kuundin"))
                .description("According to the logs from the Corona, this is where " +
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
                "destination.");
            addSystem("Kamar Inag", 24, 20);
            addSystem("Duumar Di", 24, 21);
            addSystem("Uumbuu", 25, 12);
            addSystem("Ervlan", 25, 13);
            addSystem("Gaiid", 25, 14);
            addSystem("Digapir", 25, 16);
            addSystem("Shiirla", 25, 19);
            addSystem("Dinkhaluurk", 25, 21);
            getHex(19, 13).name("black hole")
                .description("Imperial observatory with Gertie was programmed not to " +
                "be able to look at this parsec.").suppressPlanet = true;
            exports_2("spinyRatPath", spinyRatPath = []);
            add = function (hex1, offset1, hex2, offset2) {
                var segment = new model_1.PathSegment(hex1, offset1, hex2, offset2);
                spinyRatPath.push(segment);
                return segment;
            };
            add(hexes["Khida"], [-10, -4], hexes["GimiKuuid"], [0, 32]);
            add(hexes["GimiKuuid"], [0, 32], hexes["Vlair"], [0, -12]);
            add(hexes["Vlair"], [0, -12], hexes["Uure"], [0, -12]);
            add(hexes["Uure"], [0, -12], hexes["Forquee"], [0, -12]);
            add(hexes["Forquee"], [0, -12], hexes["Uure"], [-20, -20]);
            add(hexes["Uure"], [-20, -20], hexes["Vlair"], [0, -35]);
            add(hexes["Vlair"], [0, -35], hexes["GimiKuuid"], [-5, -15]);
            add(hexes["GimiKuuid"], [-5, -15], hexes["Khida"], [0, -20]);
            add(hexes["Khida"], [0, -20], hexes["Vlir"], [0, -20]);
            add(hexes["Vlir"], [0, -20], hexes["Nagilun"], [0, -20]);
            add(hexes["Nagilun"], [0, -20], hexes["Udipeni"], [-23, 23]);
            add(hexes["Udipeni"], [-23, 23], hexes["Ugar"], [0, -10]);
            add(hexes["Ugar"], [0, -10], hexes["Girgulash"], [25, 0]);
            add(hexes["Girgulash"], [25, 0], hexes["Ugar"], [-15, 30]);
            add(hexes["Ugar"], [-15, 30], hexes["Nagilun"], [-10, 5]);
            add(hexes["Nagilun"], [-10, 5], hexes["Kagershi"], [-10, 0]);
            add(hexes["Kagershi"], [-10, 0], hexes["Gowandon"], [-10, -10]);
            add(hexes["Gowandon"], [-10, -10], hexes["Kuundin"], [-10, 0]);
            add(hexes["Kuundin"], [-10, 0], hexes["IrarLar"], [-10, 0]);
            add(hexes["IrarLar"], [-10, 0], hexes["Nagilun"], [20, 0]);
        }
    };
});
// Copyright (C) 2013 Chris Shabsin
System.register("hexmap", [], function (exports_3, context_3) {
    "use strict";
    var Hexmap, hexbinAngles;
    var __moduleName = context_3 && context_3.id;
    function isCellShown(mapobj, col, row) {
        if (col >= mapobj.width || row >= mapobj.height) {
            return false;
        }
        return mapobj.grid[col][row].meshShown;
    }
    function isDownRightShown(mapobj, col, row) {
        if (isCellDown(mapobj, col, row)) {
            return isCellShown(mapobj, col + 1, row + 1);
        }
        else {
            return isCellShown(mapobj, col + 1, row);
        }
    }
    function isDownShown(mapobj, col, row) {
        return isCellShown(mapobj, col, row + 1);
    }
    // Returns true if the cell is a "down" cell in its row.
    function isCellDown(mapobj, col, row) {
        if (mapobj.staggerUp) {
            return col % 2 == 1;
        }
        else {
            return col % 2 == 0;
        }
    }
    function calculateCenter(mapobj, col, row) {
        var x = mapobj.dx * col + mapobj.radius;
        var y = mapobj.dy * row + mapobj.radius * Math.sin(Math.PI / 3);
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
        return hexbinAngles.map(function (angle) {
            var x1 = Math.sin(angle) * radius;
            var y1 = -Math.cos(angle) * radius;
            // TODO: avoid e notation ("1.3e-16" for 0) - use .toFixed(10)
            var coord = [x1 - x0, y1 - y0];
            x0 = x1; // Next coord is relative to this one.
            y0 = y1;
            return coord;
        });
    }
    function svgPoint(point) {
        return point[0].toFixed(10) + "," + point[1].toFixed(10);
    }
    return {
        setters: [],
        execute: function () {
            Hexmap = /** @class */ (function () {
                // width and height are counted in cells.
                // radius of a cell (in pixels? What does SVG count in?)
                // If staggerUp, then top left corner is up and to the left of
                // the cell to its right. Otherwise, it is down and to the
                // left of the cell to its right.
                function Hexmap(width, height, radius, staggerUp) {
                    this.width = width;
                    this.height = height;
                    this.radius = radius;
                    this.staggerUp = staggerUp;
                    this.dx = radius * 1.5;
                    this.dy = radius * 2 * Math.sin(Math.PI / 3);
                    this.grid = new Array(width);
                    // TODO: find a faster, more JSish, way to initialize this.
                    for (var x = 0; x < width; x++) {
                        this.grid[x] = new Array(height);
                        for (var y = 0; y < height; y++) {
                            // TODO: replace this simple object with a Hex maybe?
                            this.grid[x][y] = {
                                x: x,
                                y: y,
                                meshShown: true,
                                center: calculateCenter(this, x, y),
                            };
                        }
                    }
                }
                Hexmap.prototype.getPixHeight = function () {
                    return this.dy * (this.height + 0.5);
                };
                Hexmap.prototype.getPixWidth = function () {
                    return this.dx * this.width + this.radius * Math.sin(Math.PI / 6);
                };
                Hexmap.prototype.getCell = function (x, y) {
                    return this.grid[x][y];
                };
                Hexmap.prototype.gridMesh = function () {
                    // Returns the SVG path with the grid starting at the top left
                    // corner of the (0, 0) hex.
                    //
                    // Usage: $path.attr("d", hexmap.gridMesh());
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
                            var sep = "\n";
                            path += "M" + svgPoint(this.grid[x][y].center) + sep;
                            path += "m" + svgPoint(hex[0]) + sep;
                            // draw these edges only if we're not going to draw that edge again.
                            drawn[3] = !isDownRightShown(this, x, y);
                            drawn[4] = !isDownShown(this, x, y);
                            for (var i = 0; i < 6; i++) {
                                if (drawn[i]) {
                                    path += "l" + svgPoint(hex[i + 1]) + sep;
                                }
                                else {
                                    path += "m" + svgPoint(hex[i + 1]) + sep;
                                }
                            }
                        }
                    }
                    return path;
                };
                // view.js needs getCenter and getHexagon from this interface.
                Hexmap.prototype.getCenter = function (x, y) {
                    return this.getCell(x, y).center;
                };
                ;
                // Returns the SVG path for a hexagon.
                Hexmap.prototype.getHexagon = function () {
                    return "m" + hexagon(this.radius).join("l");
                };
                return Hexmap;
            }());
            exports_3("Hexmap", Hexmap);
            hexbinAngles = [
                -Math.PI / 2, -Math.PI / 6, Math.PI / 6, Math.PI / 2,
                5 * Math.PI / 6, 7 * Math.PI / 6, 3 * Math.PI / 2
            ];
        }
    };
});
System.register("json", [], function (exports_4, context_4) {
    "use strict";
    var __moduleName = context_4 && context_4.id;
    function MakeJson(cols, rows, hexArray, spinyRatPath) {
        var bodyContents = "";
        for (var i = 0; i < cols; i++) {
            for (var j = 0; j < rows; j++) {
                var json = hexArray[i][j].toJson();
                if (json) {
                    bodyContents += JSON.stringify(json) + "<br>";
                }
            }
        }
        for (var i = 0; i < spinyRatPath.length; i++) {
            bodyContents += JSON.stringify(spinyRatPath[i].toJson()) + "<br>";
        }
        return bodyContents;
    }
    exports_4("MakeJson", MakeJson);
    return {
        setters: [],
        execute: function () {
        }
    };
});
// Copyright (C) 2013 Chris Shabsin
System.register("util", [], function (exports_5, context_5) {
    "use strict";
    var __moduleName = context_5 && context_5.id;
    // Create a properly-namespaced SVG element
    function makeSVG(tag, attrs) {
        var elem = document.createElementNS('http://www.w3.org/2000/svg', tag);
        for (var key in attrs) {
            elem.setAttribute(key, attrs[key]);
        }
        return elem;
    }
    function makeSVGAnchor() {
        return makeSVG("a", {});
    }
    function $makeSVG(tag, attrs) {
        return $(makeSVG(tag, attrs));
    }
    exports_5("$makeSVG", $makeSVG);
    function $makeSVGAnchor() {
        return $(makeSVGAnchor());
    }
    exports_5("$makeSVGAnchor", $makeSVGAnchor);
    return {
        setters: [],
        execute: function () {
        }
    };
});
System.register("view", ["util"], function (exports_6, context_6) {
    "use strict";
    var util_1, $arrowDefs;
    var __moduleName = context_6 && context_6.id;
    function setClickData($data, cell) {
        return function () {
            $data.data("clickCell", cell);
            cell.hilite(true);
            $data.html(cell.makeDescription());
        };
    }
    function setHoverData($data, cell) {
        return function () {
            if ($data.data("clickCell")) {
                $data.data("clickCell").hilite(false);
            }
            cell.hilite(true);
            $data.html(cell.makeDescription());
        };
    }
    function resetHoverData($data, cell) {
        return function () {
            cell.hilite(false);
            if ($data.data("clickCell")) {
                $data.data("clickCell").hilite(true);
                $data.html($data.data("clickCell").makeDescription());
            }
        };
    }
    function associateElementWithEntity($elem, $data, entity) {
        $elem.click(setClickData($data, entity))
            .hover(setHoverData($data, entity), resetHoverData($data, entity));
    }
    exports_6("associateElementWithEntity", associateElementWithEntity);
    function makeAnchorFromHex(hmap, hex, class_prefix) {
        var $anchor = util_1.$makeSVGAnchor();
        if (!class_prefix) {
            class_prefix = "";
        }
        // Path and anchor class do not vary with suffix. (Should this be true?)
        $anchor.append(util_1.$makeSVG("path", {
            "class": class_prefix + "hexagon",
            d: hmap.getHexagon(),
        }));
        $anchor.attr({
            "class": class_prefix + "anchor"
        });
        var class_suffix = "";
        if (hex.href()) {
            class_suffix = "-link";
        }
        $anchor.append(util_1.$makeSVG("text", {
            y: 50,
            "class": class_prefix + "coord" + class_suffix,
        }).text(hex.getDisplayCoord()));
        if (hex.name()) {
            $anchor.append(util_1.$makeSVG("text", {
                y: 20,
                "class": class_prefix + "name" + class_suffix,
            }).text(hex.name()));
        }
        if (hex.hasSystem()) {
            $anchor.append(util_1.$makeSVG("circle", {
                cx: 0,
                cy: 0,
                r: 5,
                "class": class_prefix + "planet" + class_suffix,
            }));
        }
        hex.setHiliteCallback(function (val) {
            if (val) {
                $anchor.children("path").attr({
                    "class": class_prefix + "hexagon-hilite"
                });
            }
            else {
                $anchor.children("path").attr({
                    "class": class_prefix + "hexagon"
                });
            }
        });
        $anchor.attr({
            transform: "translate(" + hmap.getCenter(hex.col(), hex.row()) + ")",
        });
        return $anchor;
    }
    exports_6("makeAnchorFromHex", makeAnchorFromHex);
    function cellFromHex(hmap, hex) {
        return hmap.getCell(hex.col(), hex.row());
    }
    function pointRel(hmap, hex, offset) {
        var cell = cellFromHex(hmap, hex);
        return [cell.center[0] + offset[0], cell.center[1] + offset[1]];
    }
    function makeElementFromPathSegment(hmap, pathSegment) {
        var curpath = [
            pointRel(hmap, pathSegment.sourceHex(), pathSegment.sourceOffset()),
            pointRel(hmap, pathSegment.destinationHex(), pathSegment.destinationOffset())
        ];
        var spinyRatPathString = "M" + curpath[0] + "L" + curpath[1];
        var $g = util_1.$makeSVG("g");
        pathSegment.setHiliteCallback(function (val) {
            if (val) {
                $g.children(".spiny-rat").attr({
                    "class": "spiny-rat-hilite",
                    "marker-end": "url(#triangle-hilite)",
                });
            }
            else {
                $g.children(".spiny-rat-hilite").attr({
                    "class": "spiny-rat",
                    "marker-end": "url(#triangle)",
                });
            }
        });
        associateElementWithEntity($g, null /*$data*/, pathSegment);
        $g.append(util_1.$makeSVG("path", {
            "class": "spiny-rat",
            d: spinyRatPathString,
            "marker-end": "url(#triangle)",
        }));
        $g.append(util_1.$makeSVG("path", {
            "class": "spiny-rat-wide",
            d: spinyRatPathString
        }));
        return $g;
    }
    exports_6("makeElementFromPathSegment", makeElementFromPathSegment);
    function scrollToHex(hmap, hex) {
        var x = {
            scrollTop: cellFromHex(hmap, hex).anchor.offset().top,
            scrollLeft: cellFromHex(hmap, hex).anchor.offset().left
        };
        $("html, body").animate(x, 750);
    }
    exports_6("scrollToHex", scrollToHex);
    return {
        setters: [
            function (util_1_1) {
                util_1 = util_1_1;
            }
        ],
        execute: function () {
            exports_6("$arrowDefs", $arrowDefs = util_1.$makeSVG("defs"));
            $arrowDefs.append(util_1.$makeSVG("marker", {
                id: "triangle",
                viewBox: "0 0 30 30",
                refX: 30,
                refY: 15,
                markerUnits: "strokeWidth",
                markerWidth: 12,
                markerHeight: 9,
                orient: "auto",
            }).append(util_1.$makeSVG("path", {
                d: "M 0 0 L 30 15 L 0 30 z",
                "class": "spiny-rat",
            })));
            $arrowDefs.append(util_1.$makeSVG("marker", {
                id: "triangle-hilite",
                viewBox: "0 0 30 30",
                refX: 30,
                refY: 15,
                markerUnits: "strokeWidth",
                markerWidth: 12,
                markerHeight: 9,
                orient: "auto",
            }).append(util_1.$makeSVG("path", {
                d: "M 0 0 L 30 15 L 0 30 z",
                "class": "spiny-rat-hilite",
            })));
        }
    };
});
// main.
System.register("main", ["hexmap", "data", "util", "view"], function (exports_7, context_7) {
    "use strict";
    var hexmap_1, data_1, util_2, view_1, myMap, margin, $map, $svg, $mapGroup, $data, $path, $settings, checkbox, $label;
    var __moduleName = context_7 && context_7.id;
    return {
        setters: [
            function (hexmap_1_1) {
                hexmap_1 = hexmap_1_1;
            },
            function (data_1_1) {
                data_1 = data_1_1;
            },
            function (util_2_1) {
                util_2 = util_2_1;
            },
            function (view_1_1) {
                view_1 = view_1_1;
            }
        ],
        execute: function () {
            myMap = new hexmap_1.Hexmap(data_1.cols, data_1.rows, 70);
            margin = 10;
            $map = $("#map-contents");
            $svg = util_2.$makeSVG("svg", {
                height: String(myMap.getPixHeight() + 2 * margin) + "px",
                width: String(myMap.getPixWidth() + 2 * margin + 300) + "px",
            }).appendTo($map);
            $svg.append(view_1.$arrowDefs);
            $mapGroup = util_2.$makeSVG("g", {
                "class": "map-anchor-group",
                transform: "translate(" + margin + "," + margin + ")",
            });
            $svg.append($mapGroup);
            // Draw the map mesh.
            $mapGroup.append(util_2.$makeSVG("path", {
                "class": "map-mesh",
                d: myMap.gridMesh(),
            }));
            $data = $("#data-contents");
            // Add the individual map cells.
            for (var x = 0; x < data_1.cols; x++) {
                for (var y = 0; y < data_1.rows; y++) {
                    var cell = myMap.getCell(x, y);
                    cell.anchor = view_1.makeAnchorFromHex(myMap, data_1.hexArray[x][y], "map-");
                    $mapGroup.append(cell.anchor);
                    view_1.associateElementWithEntity(cell.anchor, $data, data_1.hexArray[x][y]);
                }
            }
            // Draw the path of the Spiny Rat.
            for (var i = 0; i < data_1.spinyRatPath.length; i++) {
                var el = view_1.makeElementFromPathSegment(myMap, data_1.spinyRatPath[i]);
                $mapGroup.append(el);
            }
            $path = $(".spiny-rat,.spiny-rat-wide");
            // Add the settings checkbox
            $settings = $("#settings");
            checkbox = document.createElement("input");
            checkbox.className = 'map-setting';
            checkbox.id = 'showpath';
            checkbox.type = 'checkbox';
            checkbox.checked = true;
            $settings.append(checkbox);
            $label = $("<label>", {
                "for": "showpath",
            })
                .text("Spiny Rat")
                .appendTo($settings);
            checkbox.onchange = function (ev) {
                if (checkbox.checked) {
                    $path.show();
                }
                else {
                    $path.hide();
                }
            };
            view_1.scrollToHex(myMap, data_1.hexArray[1][4]);
        }
    };
});
