$( document ).ready(function() {
    var $map = $("#map");
    var $svg = $makeSVG("svg", {height:300, width:300});
    $map.append($svg);
    var $g = $makeSVG("g", {
	"class": "map-anchor-group",
	transform: "translate(10, 10)",
    });
    $svg.append($g);
    var $path = $makeSVG("path", {"class": "map-mesh"});
    $g.append($path);
    
    var myMap = new hexmap.Hexmap(4, 4, 10);
    
    $path.attr("d", myMap.gridMesh());
});
