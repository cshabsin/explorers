var myMap = new hexmap.Hexmap(static_data, 70, "map-");
var margin = 10;

var $map = $("#map-contents");
var $svg = $makeSVG("svg", {
    height: String(myMap.getPixHeight() + 2*margin) + "px",
    width: String(myMap.getPixWidth() + 2*margin + 300) + "px",
}).appendTo($map);
$svg.append(view.$arrowDefs);

var $mapGroup = $makeSVG("g", {
    "class": "map-anchor-group",
    transform: "translate(" + margin + "," + margin + ")",
}).appendTo($svg);

// Draw the map.
myMap.appendTo($mapGroup);

var $data = $("#data-contents");

// Add the individual map cells.

// Draw the path of the Spiny Rat.
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

view.scrollToHex(myMap, hexArray[1][4]);
