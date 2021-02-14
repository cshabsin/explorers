// Copyright (C) 2013 Chris Shabsin

// Create a properly-namespaced SVG element
export function makeSVG(tag: string, attrs: { [x: string]: any; }): SVGElement {
    var elem = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (var key in attrs) {
        elem.setAttribute(key, attrs[key]);
    }
    return elem;
}
