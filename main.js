var myMap = new hexmap.Hexmap(cols, rows, 70);
var margin = 10;

var $map = $("#map-contents");
var $svg = $makeSVG("svg", {
    height: String(myMap.getPixHeight() + 2*margin) + "px",
    width: String(myMap.getPixWidth() + 2*margin) + "px",
}).appendTo($map);

var $defs = $makeSVG("defs").appendTo($svg);
$defs.append($makeSVG("marker", {
    id: "Triangle",
    viewBox: "0 0 30 30",
    refX: 30,
    refY: 15,
    markerUnits: "strokeWidth",
    markerWidth: 12,
    markerHeight: 9,
    orient: "auto"
}).append($makeSVG("path", {
    d: "M 0 0 L 30 15 L 0 30 z",
    "class": "spiny-rat",
})));
$defs.append($makeSVG("marker", {
    id: "HiliteTriangle",
    viewBox: "0 0 30 30",
    refX: 30,
    refY: 15,
    markerUnits: "strokeWidth",
    markerWidth: 12,
    markerHeight: 9,
    orient: "auto"
}).append($makeSVG("path", {
    d: "M 0 0 L 30 15 L 0 30 z",
    "class": "spiny-rat-hilite",
})));

var $mapGroup = $makeSVG("g", {
    "class": "map-anchor-group",
    transform: "translate(" + margin + "," + margin + ")",
}).appendTo($svg);

// Draw the map mesh.
$mapGroup.append($makeSVG("path", {
    "class": "map-mesh",
    d: myMap.gridMesh(),
}));

var $data = $("#data-contents");

function setClickData(cell) {
    return function() {
	$data.data("clickCell", cell);
	cell.hilite(true);
	$data.html(cell.makeDescription());
    };
}

function setHoverData(cell) {
    return function() {
	if ($data.data("clickCell")) {
	    $data.data("clickCell").hilite(false);
	}
	cell.hilite(true);
	$data.html(cell.makeDescription());
    };
}

function resetHoverData(cell) {
    return function() {
	cell.hilite(false);
	if ($data.data("clickCell")) {
	    $data.data("clickCell").hilite(true);
	    $data.html($data.data("clickCell").makeDescription());
	}
    };
}

makeAnchorFromHex = function(hex) {
    var $anchor = $makeSVGAnchor();

    $anchor.append($makeSVG("path", {
	"class": "map-hexagon",
	d: myMap.getHexagon(),
    }));

    $anchor.append($makeSVG("text", {
	y: 50,
	"class": hex.href() ? "map-coord-link" : "map-coord",
    }).text(hex.getDisplayCoord()));

    if (hex.name()) {
	$anchor.append($makeSVG("text", {
	    y: 20,
	    "class": hex.href() ? "map-name-link" : "map-name",
	}).text(hex.name()));
    }

    if (hex.hasSystem()) {
	$anchor.append($makeSVG("circle", {
	    cx: 0,
	    cy: 0,
	    r: 5,
	    "class":
	    hex.href() ? "map-planet-link": "map-planet",
	}));
    }

    hex.setHiliteCallback(function(val) {
	if (val) {
	    $anchor.children("path").attr(
		{"class": "map-hexagon-hilite"}
	    );
	} else {
	    $anchor.children("path").attr(
		{"class": "map-hexagon"}
	    );
	}
    });

    return $anchor;
};

// Add the individual map cells.
for (var x = 0; x < cols; x++) {
    for (var y = 0; y < rows; y++) {
	var cell = myMap.getCell(x, y);

	cell.data = hexArray[x][y];
	cell.anchor = makeAnchorFromHex(cell.data)
	    .attr({
		"class": "map-anchor",
		transform: "translate(" + cell.center + ")",
	    })
	    .click(setClickData(cell.data))
	    .hover(setHoverData(cell.data),
		   resetHoverData(cell.data))
	    .appendTo($mapGroup);
    }
}

// Draw the path of the Spiny Rat.
// var spinyRatPathString = "";
for (var i = 0; i < spinyRatPath.length; i++) {
    var curpath = spinyRatPath[i].getPoints();
    spinyRatPathString = "M" + curpath[0] + "L" + curpath[1];
    var $g = $makeSVG("g").appendTo($mapGroup)
	.click(setClickData(spinyRatPath[i]))
	.hover(setHoverData(spinyRatPath[i]),
	       resetHoverData(spinyRatPath[i]));
    spinyRatPath[i].element = $g;
    $makeSVG("path", {
	"class": "spiny-rat",
	d: spinyRatPathString,
	"marker-end": "url(#Triangle)",
    }).appendTo($g);
    $makeSVG("path", {
	"class": "spiny-rat-wide",
	d: spinyRatPathString
    }).appendTo($g);
}
var $path = $(".spiny-rat,.spiny-rat-wide");

// Add the settings checkbox
var $settings = $("#settings");
var $checkbox = $("<input>", {
    "class": "map-setting",
    id: "showpath",
    type: "checkbox",
    checked: "true",
}).appendTo($settings);
var $label = $("<label>", {
    "for": "showpath",
})
    .text("Spiny Rat")
    .appendTo($settings);

$checkbox.change(function(event) {
    if (this.checked) {
	$path.show();
    } else {
	$path.hide();
    }
});

$('html').animate({
    scrollTop: hexArray[1][4].cell.anchor.offset().top,
    scrollLeft: hexArray[1][4].cell.anchor.offset().left
}, 750);
