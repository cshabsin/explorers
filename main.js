var myMap = new hexmap.Hexmap(cols, rows, 70);
var margin = 10;

var $map = $("#map");
var $svg = $makeSVG("svg", {
    height: String(myMap.getPixHeight() + 2*margin) + "px",
    width: String(myMap.getPixWidth() + 2*margin) + "px",
}).appendTo($map);
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
var spinyRatPathString = "";
for (var i = 0; i < spinyRatPath.length; i++) {
    var curpath = spinyRatPath[i].getPoints();
    spinyRatPathString += "M" + curpath[0] + "L" + curpath[1] + "z";
}
var $path = $makeSVG("path", {
    "class": "spiny-rat",
    d: spinyRatPathString,
}).appendTo($mapGroup);

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
    .appendTo($settings);
$checkbox.button();
$label.text("Hide Spiny Rat");

$checkbox.change(function(event) {
    $path.attr("class", this.checked ? "spiny-rat" : "spiny-rat-invis");
    $label.text(this.checked ? "Hide Spiny Rat" : "Show Spiny Rat");
});

$map.jScrollPane();
// TODO: why doesn't this resize horizontally?
$map.resizable().resize(function(event, ui) {
    $map.jScrollPane();
});
var mapScroll = $map.data('jsp');
mapScroll.scrollToElement(hexArray[1][5].cell.anchor, true);

$("#accordion").accordion();
