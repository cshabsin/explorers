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
var $g = $makeSVG("g", {
    "class": "map-anchor-group",
    transform: "translate(" + margin + "," + margin + ")",
});
$svg.append($g);
var $path = $makeSVG("path", {
    "class": "map-mesh",
    d: myMap.gridMesh(),
});
$g.append($path);

function makeHex(cell) {
    var hex = cell.data;

    var $anchor = $makeSVG("a", {
	"class": "map-anchor",
	transform: "translate(" + cell.center + ")",
    });
    if (hex.getHref()) {
	$anchor.get(0).setAttributeNS("http://www.w3.org/1999/xlink",
				      "href", hex.getHref());
    }

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
	$g.append(makeHex(cell));
    }
}
