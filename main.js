var width = 10;
var height = 11;
var myMap = new hexmap.Hexmap(width, height, 70);

var margin = 10;

var $map = $("#map");
var $svg = $makeSVG("svg", {
    height: String(myMap.getPixHeight() + 2*margin) + "px",
    width: String(myMap.getPixWidth() + 2*margin) + "px",
});
$map.append($svg);
var $group = $makeSVG("g", {
    "class": "map-anchor-group",
    transform: "translate(" + margin + "," + margin + ")",
}).appendTo($svg);

$group.append($makeSVG("path", {
    "class": "map-mesh",
    d: myMap.gridMesh(),
}));

function makeHex(cell) {
    var hex = cell.data;

    var $anchor = $makeSVGAnchor(hex.getHref(), {
	"class": "map-anchor",
	transform: "translate(" + cell.center + ")",
    });

    $anchor.append($makeSVG("path", {
	"class": "map-hexagon",
	d: myMap.getHexagon(),
    }));

    $anchor.append($makeSVG("text", {
	y: 50,
	"class": hex.getHref() ? "map-coord-link" : "map-coord",
    }).text(hex.getDisplayCoord()));

    if (hex.getName()) {
	$anchor.append($makeSVG("text", {
	    y: 20,
	    "class": hex.getHref() ? "map-name-link" : "map-name",
	}).text(hex.getName()));
    }

    if (hex.hasSystem()) {
	$anchor.append($makeSVG("circle", {
	    cx: 0,
	    cy: 0,
	    r: 5,
	    "class": hex.getHref() ? "map-planet-link": "map-planet",
	}));
    }

    return $anchor;
}

for (var x = 0; x < width; x++) {
    for (var y = 0; y < height; y++) {
	var cell = myMap.getCell(x, y);

	cell.data = hexArray[x][y];
	$group.append(makeHex(cell));
    }
}
