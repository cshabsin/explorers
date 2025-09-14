import { Hexmap } from './hexmap.js';
import { makeSVG } from './util.js';
import {
    arrowDefs, associateElementWithEntity, makeAnchorFromHex,
    makeElementFromPathSegment, scrollToHex
} from './view.js';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { firebaseConfig } from './firebase-config.js';
import { Hex, PathSegment } from './model.js';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


let myMap = new Hexmap(10, 11, 70);
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

async function drawMap() {
    const systemsSnapshot = await getDocs(collection(db, "systems"));
    const hexesByName: { [name: string]: Hex } = {};
    const hexArray: Array<Array<Hex>> = new Array(10);
    for (let i = 0; i < 10; i++) {
        hexArray[i] = new Array<Hex>(11);
        for (let j = 0; j < 11; j++) {
            hexArray[i][j] = new Hex(i, j, 16, 11);
        }
    }

    systemsSnapshot.forEach((doc) => {
        const system = doc.data();
        const hex = hexArray[system.col][system.row];
        hex.setName(system.name);
        hex.setDescription(system.description);
        hex.setHref(system.href);
        hexesByName[system.name.replace(/\s+/g, "")] = hex;
    });

    // Add the individual map cells.
    for (let x = 0; x < 10; x++) {
        for (let y = 0; y < 11; y++) {
            let cell = myMap.getCell(x, y);

            cell.anchor = makeAnchorFromHex(myMap, hexArray[x][y], "map-");
            mapGroup.append(cell.anchor);
            associateElementWithEntity(cell.anchor, data, hexArray[x][y]);
        }
    }

    const pathsSnapshot = await getDocs(collection(db, "paths"));
    const spinyRatPath: PathSegment[] = [];
    pathsSnapshot.forEach((doc) => {
        const path = doc.data();
        const hex1 = hexesByName[path.hex1.replace(/\s+/g, "")];
        const hex2 = hexesByName[path.hex2.replace(/\s+/g, "")];
        const segment = new PathSegment(hex1, path.offset1, hex2, path.offset2);
        spinyRatPath.push(segment);
    });

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
}

drawMap();