// Create a properly-namespaced SVG element

function makeSVG(tag, attrs) {
    var elem = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (var key in attrs) {
        elem.setAttribute(key, attrs[key]);
    }
    return elem;
}

function $makeSVG(tag, attrs) {
    return $(makeSVG(tag,attrs))
}
