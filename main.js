var myMap = new hexmap.Hexmap(cols, rows, 70);
var margin = 10;

var $map = $("#map");
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

var $mapGroup = $makeSVG("g", {
    "class": "map-anchor-group",
    transform: "translate(" + margin + "," + margin + ")",
}).appendTo($svg);

// Draw the map mesh.
$mapGroup.append($makeSVG("path", {
    "class": "map-mesh",
    d: myMap.gridMesh(),
}));

// Add the individual map cells.
for (var x = 0; x < cols; x++) {
    for (var y = 0; y < rows; y++) {
	var cell = myMap.getCell(x, y);
	hexArray[x][y].setCell(cell);

	cell.data = hexArray[x][y];
	cell.anchor = cell.data.makeAnchor().attr({
	    "class": "map-anchor",
	    transform: "translate(" + cell.center + ")",
	}).appendTo($mapGroup);
    }
}

// Draw the path of the Spiny Rat.
// var spinyRatPathString = "";
for (var i = 0; i < spinyRatPath.length; i++) {
    var curpath = spinyRatPath[i].getPoints();
    spinyRatPathString = "M" + curpath[0] + "L" + curpath[1];
    $makeSVG("path", {
	"class": "spiny-rat",
	d: spinyRatPathString,
	"marker-end": "url(#Triangle)",
    }).appendTo($mapGroup);
}
var $path = $(".spiny-rat");

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
    $path.attr("class", this.checked ? "spiny-rat" : "spiny-rat-invis");
});

$map.jScrollPane();
// TODO: why doesn't this resize horizontally?
$map.resizable().resize(function(event, ui) {
    $map.jScrollPane();
});
var mapScroll = $map.data('jsp');
mapScroll.scrollToElement(hexArray[1][5].cell.anchor, true);
