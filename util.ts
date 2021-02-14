// Copyright (C) 2013 Chris Shabsin

// Create a properly-namespaced SVG element
function makeSVG(tag: string, attrs: { [x: string]: any; }) {
    var elem = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (var key in attrs) {
        elem.setAttribute(key, attrs[key]);
    }
    return elem;
}

function makeSVGAnchor() {
    return makeSVG("a", {});
}

export function $makeSVG(tag: string,
    attrs?: {
        height?: string;
        width?: string;
        class?: string;
        transform?: string;
        d?: any;
        id?: string;
        viewBox?: string;
        refX?: number;
        refY?: number;
        markerUnits?: string;
        markerWidth?: number;
        markerHeight?: number;
        orient?: string;
        y?: number;
        cx?: number;
        cy?: number;
        r?: number;
        "marker-end"?: string;
    }) {
    return $(makeSVG(tag, attrs))
}

export function $makeSVGAnchor() {
    return $(makeSVGAnchor());
}
