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

let pinned: Entity | null = null;
let isEditing = false;

export function setIsEditing(val: boolean) {
    isEditing = val;
}

// callback for when user clicks on the element.
export function setClickData(data: Element, cell: Entity) {
    if (pinned === cell) {
        pinned.hilite(false);
        pinned = null;
        data.innerHTML = "";
    } else {
        if (pinned) {
            pinned.hilite(false);
        }
        pinned = cell;
        cell.hilite(true);
        data.innerHTML = cell.makeDescription();
    }
}

// callback for when user hovers over element.
function setHoverData(data: Element, cell: Entity) {
    if (!pinned && !isEditing) {
        data.innerHTML = cell.makeDescription();
    }
    cell.hilite(true);
}

// callback for when mouse leaves the element.
function resetHoverData(data: Element, cell: Entity) {
    if (pinned !== cell) {
        cell.hilite(false);
    }
    if (pinned) {
        data.innerHTML = pinned.makeDescription();
    } else if (!isEditing) {
        data.innerHTML = "";
    }
}

export function associateElementWithEntity(elem: SVGElement, data: Element | null, entity: Entity) {
    // TODO: Figure out a better way to handle the possibility of null from getElementById.
    if (data === null) {
        return;
    }
    elem.addEventListener("click", () => {
        setClickData(data, entity);
    });
    elem.addEventListener("mouseenter", () => {
        setHoverData(data, entity);
    });
    elem.addEventListener("mouseleave", () => {
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

    const nameElement = makeSVG("text", {
        y: 20,
    });
    anchor.append(nameElement);

    const planetElement = makeSVG("circle", {
        cx: 0,
        cy: 0,
        r: 5,
    });
    anchor.append(planetElement);

    const updateHexAppearance = () => {
        requestAnimationFrame(() => {
            let class_suffix = "";
            if (hex.getHref()) {
                class_suffix = "-link";
            }

            anchor.querySelectorAll("." + class_prefix + "coord").forEach((el) => {
                el.setAttribute("class", class_prefix + "coord" + class_suffix);
            });

            nameElement.textContent = hex.getName();
            nameElement.setAttribute("class", class_prefix + "name" + class_suffix);

            planetElement.setAttribute("class", class_prefix + "planet" + class_suffix);
            planetElement.style.display = hex.hasSystem() ? "block" : "none";
        });
    };

    hex.setUpdateCallback(updateHexAppearance);

    let t = makeSVG("text", {
        y: 50,
        "class": class_prefix + "coord",
    });
    t.textContent = hex.getDisplayCoord();
    anchor.append(t);

    updateHexAppearance();

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

    const dateElement = makeSVG("text", {});
    g.append(dateElement);

    pathSegment.setUpdateCallback(() => {
        var curpath = [
            pointRel(hmap, pathSegment.sourceHex, pathSegment.sourceOffset),
            pointRel(hmap, pathSegment.destinationHex, pathSegment.destinationOffset)
        ];
        let spinyRatPathString = "M" + curpath[0] + "L" + curpath[1];
        g.querySelectorAll("path").forEach((el) => {
            el.setAttribute("d", spinyRatPathString);
        });

        if (pathSegment.startDate) {
            let dateStr = `${pathSegment.startDate.day}-${pathSegment.startDate.year}`;
            if (pathSegment.endDate) {
                dateStr += ` to ${pathSegment.endDate.day}-${pathSegment.endDate.year}`;
            }
            dateElement.textContent = dateStr;
            // Position the text in the middle of the path
            const midX = (curpath[0][0] + curpath[1][0]) / 2;
            const midY = (curpath[0][1] + curpath[1][1]) / 2;
            dateElement.setAttribute("x", String(midX));
            dateElement.setAttribute("y", String(midY));
        } else {
            dateElement.textContent = "";
        }
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
