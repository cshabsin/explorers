import { Hexmap } from './hexmap.js';
import { makeSVG } from './util.js';
import {
    arrowDefs, associateElementWithEntity, makeAnchorFromHex,
    makeElementFromPathSegment, scrollToHex
} from './view.js';
import { collection, onSnapshot, QuerySnapshot, DocumentChange } from 'firebase/firestore';
import { Hex, PathSegment, Entity } from './model.js';

export function initMap(db: any) {
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

    const entities: { [id: string]: Entity } = {};
    const hexesByName: { [name: string]: Hex } = {};
    const hexArray: Array<Array<Hex>> = new Array(10);
    for (let i = 0; i < 10; i++) {
        hexArray[i] = new Array<Hex>(11);
        for (let j = 0; j < 11; j++) {
            hexArray[i][j] = new Hex(i, j, 16, 11);
        }
    }

    (window as any).getEntities = () => entities;

    // Add the individual map cells.
    for (let x = 0; x < 10; x++) {
        for (let y = 0; y < 11; y++) {
            let cell = myMap.getCell(x, y);

            cell.anchor = makeAnchorFromHex(myMap, hexArray[x][y], "map-");
            mapGroup.append(cell.anchor);
            associateElementWithEntity(cell.anchor, data, hexArray[x][y]);
        }
    }

    onSnapshot(collection(db, "systems"), (snapshot: QuerySnapshot) => {
        snapshot.docChanges().forEach((change: DocumentChange) => {
            const system = change.doc.data();
            const hex = hexArray[system.col][system.row];
            hex.id = change.doc.id;
            entities[hex.id] = hex;
            if (change.type === "added" || change.type === "modified") {
                const oldName = hex.getName();
                if (oldName && oldName !== system.name) {
                    delete hexesByName[oldName.replace(/\s+/g, "")];
                }
                hex.update(system);
                hexesByName[system.name.replace(/\s+/g, "")] = hex;
            } else if (change.type === "removed") {
                const oldName = hex.getName();
                if (oldName) {
                    delete hexesByName[oldName.replace(/\s+/g, "")];
                }
                hex.update({ name: "", description: "", href: "" });
            }
        });
    });

    const paths: { [id: string]: { segment: PathSegment, el: SVGElement } } = {};

    onSnapshot(collection(db, "paths"), (snapshot: QuerySnapshot) => {
        snapshot.docChanges().forEach((change: DocumentChange) => {
            const path = change.doc.data();
            const id = change.doc.id;
            if (change.type === "added") {
                const hex1 = hexesByName[path.hex1.replace(/\s+/g, "")];
                const hex2 = hexesByName[path.hex2.replace(/\s+/g, "")];
                if (hex1 && hex2) {
                    const segment = new PathSegment(hex1, path.offset1, hex2, path.offset2, path.startDate, path.endDate);
                    segment.id = id;
                    entities[id] = segment;
                    let el = makeElementFromPathSegment(myMap, segment);
                    mapGroup.append(el);
                    paths[id] = { segment, el };
                }
            } else if (change.type === "modified") {
                const hex1 = hexesByName[path.hex1.replace(/\s+/g, "")];
                const hex2 = hexesByName[path.hex2.replace(/\s+/g, "")];
                if (hex1 && hex2) {
                    paths[id].segment.update({ sourceHex: hex1, sourceOffset: path.offset1, destinationHex: hex2, destinationOffset: path.offset2, startDate: path.startDate, endDate: path.endDate, description: path.description });
                }
            } else if (change.type === "removed") {
                paths[id].el.remove();
                delete paths[id];
                delete entities[id];
            }
        });
    });

    scrollToHex(myMap, hexArray[1][4]);
}
