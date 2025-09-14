// main.

import { Hexmap } from './hexmap.js';
import { rows, cols, GetHexes, GetPath } from './data.js';
import { makeSVG } from './util.js';
import {
    arrowDefs, associateElementWithEntity, makeAnchorFromHex,
    makeElementFromPathSegment, scrollToHex
} from './view.js';

let myMap = new Hexmap(cols, rows, 70);
let margin = 10;

let map = document.getElementById("map-contents");
let svg = makeSVG("svg", {
    height: String(myMap.getPixHeight() + 2 * margin) + "px",
    width: String(myMap.getPixWidth() + 2 * margin + 300) + "px",
});
map?.append(svg);
svg.append(arrowDefs);

let mapGroup = makeSVG("g", {
    "class": "map-anchor-group",
    transform: "translate(" + margin + "," + margin + ")",
});
svg.append(mapGroup);

// Draw the map mesh.
mapGroup.append(makeSVG("path", {
    "class": "map-mesh",
    d: myMap.gridMesh(),
}));

let data = document.getElementById("data-contents");
let hexArray = GetHexes();
let spinyRatPath = GetPath();

// Add the individual map cells.
for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
        let cell = myMap.getCell(x, y);

        cell.anchor = makeAnchorFromHex(myMap, hexArray[x][y], "map-");
        mapGroup.append(cell.anchor);
        associateElementWithEntity(cell.anchor, data, hexArray[x][y]);
    }
}

// Draw the path of the Spiny Rat.
for (let i = 0; i < spinyRatPath.length; i++) {
    let el = makeElementFromPathSegment(myMap, spinyRatPath[i]);
    mapGroup.append(el);
}
let path = <NodeListOf<SVGElement>>document.querySelectorAll(".spiny-rat,.spiny-rat-wide");

// Add the settings checkbox
let settings = document.querySelector("#settings");
let checkbox = document.createElement("input");
checkbox.className = 'map-setting';
checkbox.id = 'showpath';
checkbox.type = 'checkbox';
checkbox.checked = true;
settings?.append(checkbox);

let label = document.createElement("label");
label.setAttribute("for", "showpath");
label.innerText = "Spiny Rat";
settings?.append(label);

checkbox.onchange = (ev: Event) => {
    let display = "none";
    if (checkbox.checked) {
        display = "block";
    }
    path.forEach(
        (e: SVGElement) => {
            e.style.display = display;
        }
    );
};

scrollToHex(myMap, hexArray[1][4]);
