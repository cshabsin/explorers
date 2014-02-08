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

// Add the individual map cells.
for (var x = 0; x < cols; x++) {
    for (var y = 0; y < rows; y++) {
	var cell = myMap.getCell(x, y);
	hexArray[x][y].setCell(cell);

	cell.data = hexArray[x][y];
	cell.anchor = cell.data.makeAnchor()
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

$map.jScrollPane();
// TODO: why doesn't this resize horizontally?
$map.resizable().resize(function(event, ui) {
    $map.jScrollPane();
});
var mapScroll = $map.data('jsp');
mapScroll.scrollToElement(hexArray[1][5].cell.anchor, true);
