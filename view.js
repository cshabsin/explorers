view = (function() {
    var $arrowDefs = $makeSVG("defs");
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

    function setClickData($data, cell) {
        return function() {
            $data.data("clickCell", cell);
            cell.hilite(true);
            $data.html(cell.makeDescription());
        };
    }

    function setHoverData($data, cell) {
        return function() {
            if ($data.data("clickCell")) {
                $data.data("clickCell").hilite(false);
            }
            cell.hilite(true);
            $data.html(cell.makeDescription());
        };
    }

    function resetHoverData($data, cell) {
        return function() {
            cell.hilite(false);
            if ($data.data("clickCell")) {
                $data.data("clickCell").hilite(true);
                $data.html($data.data("clickCell").makeDescription());
            }
        };
    }

    function associateElementWithEntity($elem, $data, entity) {
        $elem.click(setClickData($data, entity))
            .hover(setHoverData($data, entity), resetHoverData($data, entity));
    }
    
    function makeAnchorFromHex(hmap, hex, class_prefix) {
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

        class_suffix = "";
        if (hex.href()) {
            class_suffix = "-link";
        }

        $anchor.append($makeSVG("text", {
            y: 50,
            "class": class_prefix + "coord" + class_suffix,
        }).text(hex.getDisplayCoord()));

        if (hex.name()) {
            $anchor.append($makeSVG("text", {
                y: 20,
                "class": class_prefix + "name" + class_suffix,
            }).text(hex.name()));
        }

        if (hex.hasSystem()) {
            $anchor.append($makeSVG("circle", {
                cx: 0,
                cy: 0,
                r: 5,
                "class": class_prefix + "planet" + class_suffix,
            }));
        }

        hex.setHiliteCallback(function(val) {
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
            transform: "translate(" + hmap.getCenter(hex.col(),
                                                     hex.row()) + ")",
        });
        return $anchor;
    }

    function cellFromHex(hmap, hex) {
        return hmap.getCell(hex.col(), hex.row());
    }

    function pointRel(hmap, hex, offset) {
        var cell = cellFromHex(hmap, hex);
        return [cell.center[0] + offset[0], cell.center[1] + offset[1]];
    }

    function makeElementFromPathSegment(hmap, pathSegment) {
        var curpath = [
            pointRel(hmap, pathSegment.sourceHex(), pathSegment.sourceOffset()),
            pointRel(hmap, pathSegment.destinationHex(), pathSegment.destinationOffset())
        ];
        
        spinyRatPathString = "M" + curpath[0] + "L" + curpath[1];
        var $g = $makeSVG("g");
        pathSegment.setHiliteCallback(function(val) {
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
        view.associateElementWithEntity($g, $data, pathSegment);
        $makeSVG("path", {
            "class": "spiny-rat",
            d: spinyRatPathString,
            "marker-end": "url(#triangle)",
        }).appendTo($g);
        $makeSVG("path", {
            "class": "spiny-rat-wide",
            d: spinyRatPathString
        }).appendTo($g);

        return $g;
    }

    function scrollToHex(hmap, hex) {
        var x = {
            scrollTop: cellFromHex(hmap, hex).anchor.offset().top,
            scrollLeft: cellFromHex(hmap, hex).anchor.offset().left
        };
        $("html, body").animate(x, 750);
    }

    return {
        $arrowDefs: $arrowDefs,
        associateElementWithEntity: associateElementWithEntity,
        makeAnchorFromHex: makeAnchorFromHex,
        makeElementFromPathSegment: makeElementFromPathSegment,
        scrollToHex: scrollToHex,
        _cellFromHex: cellFromHex,
    };
})();
