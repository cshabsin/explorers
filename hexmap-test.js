$( document ).ready(function() {
    var $map = $("#map");
    var $svg = $("<svg height=3000 width=3000/>");
    $map.append($svg);
    var $g = $("<g/>");
    $g.attr("class", "map-anchor-group");
    $g.attr("transform", "translate(10, 10)");
    $svg.append($g);
    var $path = $("<path/>");
    $path.attr("class", "map-mesh");
    $g.append($path);
    
    var myMap = new hexmap.Hexmap(4, 4, 10);
    
    $path.attr("d", myMap.gridMesh());
});
