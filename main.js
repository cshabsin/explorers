// Copyright (C) 2013 Chris Shabsin

var mapdiv = d3.select("#map");
map = createMap(mapdiv, hexArray);

// for (var i = 0; i<spinyRatPath.length; i++) {
//     var curpath = spinyRatPath[i];
//     map.append("path").
// 	attr("d", "M" + curpath[0] + "L" + curpath[1] + "z").
// 	attr("class", "spiny-rat-path").
// 	attr("stroke", "white").
// 	attr("fill", "none");
// }
