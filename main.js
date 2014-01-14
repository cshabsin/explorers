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
	$mapGroup.append(cell.data.makeAnchor().attr({
	    "class": "map-anchor",
	    transform: "translate(" + cell.center + ")",
	}));
    }
}

var spinyRatPathString = "";
for (var i = 0; i < spinyRatPath.length; i++) {
    var curpath = spinyRatPath[i].getPoints();
    spinyRatPathString += "M" + curpath[0] + "L" + curpath[1] + "z";
}

var $path = $makeSVG("path", {
    "class": "spiny-rat-invis",
    d: spinyRatPathString,
}).appendTo($mapGroup);

var $settings = $("#settings");
// TODO: Make clicking this label also affect the checkbox.
var $checkbox = $("<input>", {
    "class": "map-setting",
    id: "showpath",
    type: "checkbox",
}).appendTo($settings);
var $label = $("<label>", {
    style: "color:white", 
    "for": "showpath",
})
    .text("The path of the Spiny Rat")
    .appendTo($settings);

$checkbox.change(function(event) {
    $path.attr("class", this.checked ? "spiny-rat" : "spiny-rat-invis");
});
