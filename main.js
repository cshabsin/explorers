"use strict";
// main.
Object.defineProperty(exports, "__esModule", { value: true });
var hexmap_1 = require("./hexmap");
var data_1 = require("./data");
var util_1 = require("./util");
var view_1 = require("./view");
var myMap = new hexmap_1.Hexmap(data_1.cols, data_1.rows, 70);
var margin = 10;
var $map = $("#map-contents");
var $svg = util_1.$makeSVG("svg", {
    height: String(myMap.getPixHeight() + 2 * margin) + "px",
    width: String(myMap.getPixWidth() + 2 * margin + 300) + "px",
}).appendTo($map);
$svg.append(view_1.$arrowDefs);
var $mapGroup = util_1.$makeSVG("g", {
    "class": "map-anchor-group",
    transform: "translate(" + margin + "," + margin + ")",
});
$svg.append($mapGroup);
// Draw the map mesh.
$mapGroup.append(util_1.$makeSVG("path", {
    "class": "map-mesh",
    d: myMap.gridMesh(),
}));
var $data = $("#data-contents");
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
var $path = $(".spiny-rat,.spiny-rat-wide");
// Add the settings checkbox
var $settings = $("#settings");
var checkbox = document.createElement("input");
checkbox.className = 'map-setting';
checkbox.id = 'showpath';
checkbox.type = 'checkbox';
checkbox.checked = true;
$settings.append(checkbox);
var $label = $("<label>", {
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
