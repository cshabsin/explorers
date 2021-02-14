"use strict";
// Copyright (C) 2013 Chris Shabsin
Object.defineProperty(exports, "__esModule", { value: true });
exports.$makeSVGAnchor = exports.$makeSVG = void 0;
// Create a properly-namespaced SVG element
function makeSVG(tag, attrs) {
    var elem = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (var key in attrs) {
        elem.setAttribute(key, attrs[key]);
    }
    return elem;
}
function makeSVGAnchor() {
    return makeSVG("a", {});
}
function $makeSVG(tag, attrs) {
    return $(makeSVG(tag, attrs));
}
exports.$makeSVG = $makeSVG;
function $makeSVGAnchor() {
    return $(makeSVGAnchor());
}
exports.$makeSVGAnchor = $makeSVGAnchor;
