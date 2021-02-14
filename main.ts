// main.

import { Hexmap } from './hexmap';
import { rows, cols, hexArray, spinyRatPath } from './data';
import { $makeSVG } from './util';
import {
    $arrowDefs, associateElementWithEntity, makeAnchorFromHex,
    makeElementFromPathSegment, scrollToHex
} from './view';

let myMap = new Hexmap(cols, rows, 70);
let margin = 10;

let $map = $("#map-contents");
let $svg = $makeSVG("svg", {
    height: String(myMap.getPixHeight() + 2 * margin) + "px",
    width: String(myMap.getPixWidth() + 2 * margin + 300) + "px",
}).appendTo($map);
$svg.append($arrowDefs);

let $mapGroup = $makeSVG("g", {
    "class": "map-anchor-group",
    transform: "translate(" + margin + "," + margin + ")",
});
$svg.append($mapGroup);

// Draw the map mesh.
$mapGroup.append($makeSVG("path", {
    "class": "map-mesh",
    d: myMap.gridMesh(),
}));

let $data = $("#data-contents");

// Add the individual map cells.
for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
        let cell = myMap.getCell(x, y);

        cell.anchor = makeAnchorFromHex(myMap, hexArray[x][y], "map-");
        $mapGroup.append(cell.anchor);
        associateElementWithEntity(cell.anchor, $data, hexArray[x][y]);
    }
}

// Draw the path of the Spiny Rat.
for (let i = 0; i < spinyRatPath.length; i++) {
    let el = makeElementFromPathSegment(myMap, spinyRatPath[i]);
    $mapGroup.append(el);
}
let $path = $(".spiny-rat,.spiny-rat-wide");

// Add the settings checkbox
let $settings = $("#settings");
let checkbox = document.createElement("input");
checkbox.className = 'map-setting';
checkbox.id = 'showpath';
checkbox.type = 'checkbox';
checkbox.checked = true;
$settings.append(checkbox);

let $label = $("<label>", {
    "for": "showpath",
})
    .text("Spiny Rat")
    .appendTo($settings);

checkbox.onchange = (ev: Event) => {
    if (checkbox.checked) {
        $path.show();
    } else {
        $path.hide();
    }
};

scrollToHex(myMap, hexArray[1][4]);
