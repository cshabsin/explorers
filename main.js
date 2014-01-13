var myMap = new hexmap.Hexmap(cols, rows, 70);
var margin = 10;

var $map = $("#map");
var $svg = $makeSVG("svg", {
    height: String(myMap.getPixHeight() + 2*margin) + "px",
    width: String(myMap.getPixWidth() + 2*margin) + "px",
}).appendTo($map);
var $group = $makeSVG("g", {
    "class": "map-anchor-group",
    transform: "translate(" + margin + "," + margin + ")",
}).appendTo($svg);

// Draw the map mesh.
$group.append($makeSVG("path", {
    "class": "map-mesh",
    d: myMap.gridMesh(),
}));

// Add the individual map cells.
for (var x = 0; x < cols; x++) {
    for (var y = 0; y < rows; y++) {
	var cell = myMap.getCell(x, y);

	cell.data = hexArray[x][y];
	$group.append(cell.data.makeAnchor().attr({
	    "class": "map-anchor",
	    transform: "translate(" + cell.center + ")",
	}));
    }
}
