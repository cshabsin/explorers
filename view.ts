import { $makeSVG, $makeSVGAnchor } from './util.js';
import { Hexmap } from './hexmap.js';
import { Hex, PathSegment } from './model.js';

export let $arrowDefs = $makeSVG("defs");
$arrowDefs.append($makeSVG("marker", {
    id: "triangle",
    viewBox: "0 0 30 30",
    refX: 30,
    refY: 15,
    markerUnits: "strokeWidth",
    markerWidth: 12,
    markerHeight: 9,
    orient: "auto",
}).append($makeSVG("path", {
    d: "M 0 0 L 30 15 L 0 30 z",
    "class": "spiny-rat",
})));
$arrowDefs.append($makeSVG("marker", {
    id: "triangle-hilite",
    viewBox: "0 0 30 30",
    refX: 30,
    refY: 15,
    markerUnits: "strokeWidth",
    markerWidth: 12,
    markerHeight: 9,
    orient: "auto",
}).append($makeSVG("path", {
    d: "M 0 0 L 30 15 L 0 30 z",
    "class": "spiny-rat-hilite",
})));

function setClickData($data: any, cell: Hex) {
    return function () {
        $data.data("clickCell", cell);
        cell.hilite(true);
        $data.html(cell.makeDescription());
    };
}

function setHoverData($data: any, cell: Hex) {
    return function () {
        if ($data.data("clickCell")) {
            $data.data("clickCell").hilite(false);
        }
        cell.hilite(true);
        $data.html(cell.makeDescription());
    };
}

function resetHoverData($data: any, cell: Hex) {
    return function () {
        cell.hilite(false);
        if ($data.data("clickCell")) {
            $data.data("clickCell").hilite(true);
            $data.html($data.data("clickCell").makeDescription());
        }
    };
}

export function associateElementWithEntity($elem: JQuery<Element>, $data: any, entity: any) {
    $elem.click(setClickData($data, entity))
        .hover(setHoverData($data, entity), resetHoverData($data, entity));
}

export function makeAnchorFromHex(hmap: Hexmap, hex: Hex, class_prefix: string) {
    var $anchor = $makeSVGAnchor();

    if (!class_prefix) {
        class_prefix = "";
    }

    // Path and anchor class do not vary with suffix. (Should this be true?)
    $anchor.append($makeSVG("path", {
        "class": class_prefix + "hexagon",
        d: hmap.getHexagon(),
    }));
    $anchor.attr({
        "class": class_prefix + "anchor"
    });

    let class_suffix = "";
    if (hex.getHref()) {
        class_suffix = "-link";
    }

    $anchor.append($makeSVG("text", {
        y: 50,
        "class": class_prefix + "coord" + class_suffix,
    }).text(hex.getDisplayCoord()));

    if (hex.getName()) {
        $anchor.append($makeSVG("text", {
            y: 20,
            "class": class_prefix + "name" + class_suffix,
        }).text(hex.getName()));
    }

    if (hex.hasSystem()) {
        $anchor.append($makeSVG("circle", {
            cx: 0,
            cy: 0,
            r: 5,
            "class": class_prefix + "planet" + class_suffix,
        }));
    }

    hex.setHiliteCallback(function (val: any) {
        if (val) {
            $anchor.children("path").attr(
                {
                    "class": class_prefix + "hexagon-hilite"
                });
        } else {
            $anchor.children("path").attr(
                {
                    "class": class_prefix + "hexagon"
                });
        }
    });

    $anchor.attr({
        transform: "translate(" + hmap.getCenter(hex.getCol(),
            hex.getRow()) + ")",
    });
    return $anchor;
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
    let $g = $makeSVG("g");
    pathSegment.setHiliteCallback((val: boolean) => {
        if (val) {
            $g.children(".spiny-rat").attr({
                "class": "spiny-rat-hilite",
                "marker-end": "url(#triangle-hilite)",
            });
        } else {
            $g.children(".spiny-rat-hilite").attr({
                "class": "spiny-rat",
                "marker-end": "url(#triangle)",
            });
        }
    });
    associateElementWithEntity($g, $("#data-contents"), pathSegment);
    $g.append($makeSVG("path", {
        "class": "spiny-rat",
        d: spinyRatPathString,
        "marker-end": "url(#triangle)",
    }));
    $g.append($makeSVG("path", {
        "class": "spiny-rat-wide",
        d: spinyRatPathString
    }));

    return $g;
}

export function scrollToHex(hmap: Hexmap, hex: Hex) {
    var x = {
        scrollTop: cellFromHex(hmap, hex).anchor?.offset()?.top,
        scrollLeft: cellFromHex(hmap, hex).anchor?.offset()?.left
    };
    $("html, body").animate(x, 750);
}
