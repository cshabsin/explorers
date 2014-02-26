var myMap = new hexmap.Hexmap(cols, rows, 70);
var margin = 10;

var $map = $("#map-contents");
var $svg = $makeSVG("svg", {
    height: String(myMap.getPixHeight() + 2*margin) + "px",
    width: String(myMap.getPixWidth() + 2*margin) + "px",
}).appendTo($map);
$svg.append(view.$arrowDefs);

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

// Add the individual map cells.
for (var x = 0; x < cols; x++) {
    for (var y = 0; y < rows; y++) {
	var cell = myMap.getCell(x, y);

	cell.data = hexArray[x][y];
	cell.anchor = view.makeAnchorFromHex(cell.data, "map-")
	    .attr({transform: "translate(" + cell.center + ")",})
	    .appendTo($mapGroup);
	view.associateElementWithEntity(cell.anchor, $data, cell.data);
    }
}

// Draw the path of the Spiny Rat.
// var spinyRatPathString = "";
for (var i = 0; i < spinyRatPath.length; i++) {
    view.makeElementFromPathSegment(myMap, spinyRatPath[i]).appendTo($mapGroup);
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

$('html').attr({
    scrollTop: "" + view._cellFromHex(myMap, hex).anchor.offset().top + "px",
    scrollLeft: "" + view._cellFromHex(myMap, hex).anchor.offset().left + "px"
}, 750);
//view.scrollToHex(myMap, hexArray[1][4]);
