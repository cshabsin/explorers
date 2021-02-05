// Copyright (C) 2013 Chris Shabsin

// Create a properly-namespaced SVG element
function makeSVG(tag, attrs) {
    var elem = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (var key in attrs) {
        elem.setAttribute(key, attrs[key]);
    }
    return elem;
}

function makeSVGAnchor(href, attrs) {
    var anchor = makeSVG("a", attrs);
    if (href) {
        anchor.setAttributeNS("http://www.w3.org/1999/xlink",
            "href", href);
    }
    return anchor;
}

function $makeSVG(tag, attrs) {
    return $(makeSVG(tag, attrs))
}

function $makeSVGAnchor(href, attrs) {
    return $(makeSVGAnchor(href, attrs));
}
