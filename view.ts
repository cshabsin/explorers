import { makeSVG } from './util.js';
import { Hexmap } from './hexmap.js';
import { Hex, PathSegment, Entity } from './model.js';

export let arrowDefs = makeSVG("defs", {});
let marker = makeSVG("marker", {
    id: "triangle",
    viewBox: "0 0 30 30",
    refX: 30,
    refY: 15,
    markerUnits: "strokeWidth",
    markerWidth: 12,
    markerHeight: 9,
    orient: "auto",
});
marker.append(makeSVG("path", {
    d: "M 0 0 L 30 15 L 0 30 z",
    "class": "spiny-rat",
}));
arrowDefs.append(marker);
marker = makeSVG("marker", {
    id: "triangle-hilite",
    viewBox: "0 0 30 30",
    refX: 30,
    refY: 15,
    markerUnits: "strokeWidth",
    markerWidth: 12,
    markerHeight: 9,
    orient: "auto",
});
marker.append(makeSVG("path", {
    d: "M 0 0 L 30 15 L 0 30 z",
    "class": "spiny-rat-hilite",
}));
arrowDefs.append(marker);

// callback for when user clicks on the element.
function setClickData(data: Element, cell: Entity) {
    cell.hilite(true);
    data.innerHTML = cell.makeDescription();
    // data.data("clickCell", cell);
}

// callback for when user hovers over element.
function setHoverData(data: Element, cell: Entity) {
    data.innerHTML = cell.makeDescription();
    // if (data.data("clickCell")) {
    //     data.data("clickCell").hilite(false);
    // }
    cell.hilite(true);
}

// callback for when mouse leaves the element.
function resetHoverData(data: Element, cell: Entity) {
    cell.hilite(false);
    //         if (data.data("clickCell")) {
    //             data.data("clickCell").hilite(true);
    // //            data.innerHTML = cell.makeDescription();
    //             data.html(data.data("clickCell").makeDescription());
    //         }
}

export function associateElementWithEntity(elem: SVGElement, data: Element | null, entity: Entity) {
    // TODO: Figure out a better way to handle the possibility of null from getElementById.
    if (data === null) {
        return;
    }
    elem.addEventListener("click", (e: Event) => {
        setClickData(data, entity);
    });
    elem.addEventListener("mouseenter", (e: Event) => {
        setHoverData(data, entity);
    });
    elem.addEventListener("mouseleave", (e: Event) => {
        resetHoverData(data, entity);
    });
}

export function makeAnchorFromHex(hmap: Hexmap, hex: Hex, class_prefix: string) {
    var anchor = makeSVG("a", {});

    if (!class_prefix) {
        class_prefix = "";
    }

    // Path and anchor class do not vary with suffix. (Should this be true?)
    anchor.append(makeSVG("path", {
        "class": class_prefix + "hexagon",
        d: hmap.getHexagon(),
    }));
    anchor.setAttribute("class", class_prefix + "anchor");

    let class_suffix = "";
    if (hex.getHref()) {
        class_suffix = "-link";
    }

    let t = makeSVG("text", {
        y: 50,
        "class": class_prefix + "coord" + class_suffix,
    });
    t.textContent = hex.getDisplayCoord();
    anchor.append(t);

    if (hex.getName()) {
        let t = makeSVG("text", {
            y: 20,
            "class": class_prefix + "name" + class_suffix,
        });
        t.textContent = hex.getName();
        anchor.append(t);
    }

    if (hex.hasSystem()) {
        anchor.append(makeSVG("circle", {
            cx: 0,
            cy: 0,
            r: 5,
            "class": class_prefix + "planet" + class_suffix,
        }));
    }

    hex.setHiliteCallback(function (val: any) {
        let class_name = class_prefix + "hexagon";
        if (val) {
            class_name += "-hilite"
        }
        anchor.querySelectorAll("path").forEach(
            (el) => { el.setAttribute("class", class_name); });
    });

    anchor.setAttribute("transform",
        "translate(" + hmap.getCenter(hex.getCol(), hex.getRow()) + ")");
    return anchor;
}

function cellFromHex(hmap: Hexmap, hex: Hex) {
    return hmap.getCell(hex.getCol(), hex.getRow());
}

function pointRel(hmap: Hexmap, hex: Hex, offset: [number, number]) {
    var cell = cellFromHex(hmap, hex);
    return [cell.center[0] + offset[0], cell.center[1] + offset[1]];
}

export function makeElementFromPathSegment(hmap: Hexmap, pathSegment: PathSegment) {
    var curpath = [
        pointRel(hmap, pathSegment.sourceHex, pathSegment.sourceOffset),
        pointRel(hmap, pathSegment.destinationHex, pathSegment.destinationOffset)
    ];

    let spinyRatPathString = "M" + curpath[0] + "L" + curpath[1];
    let g = makeSVG("g", {});
    pathSegment.setHiliteCallback((val: boolean) => {
        let url = "#triangle";
        let class_name = "spiny-rat"
        if (val) {
            url += "-hilite";
            class_name += "-hilite";
        }
        g.querySelectorAll(".spiny-rat,.spiny-rat-hilite").forEach(
            (e) => {
                e.setAttribute("class", class_name);
                e.setAttribute("marker-end", `url(${url})`);
            }
        )
    });
    associateElementWithEntity(g, document.getElementById("data-contents"), pathSegment);
    g.append(makeSVG("path", {
        "class": "spiny-rat",
        d: spinyRatPathString,
        "marker-end": "url(#triangle)",
    }));
    g.append(makeSVG("path", {
        "class": "spiny-rat-wide",
        d: spinyRatPathString
    }));

    return g;
}

export function scrollToHex(hmap: Hexmap, hex: Hex) {
    cellFromHex(hmap, hex).anchor?.scrollIntoView({ behavior: "smooth" });
}
