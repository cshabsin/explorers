// Copyright (c) 2013, Michael Bostock
// Derived from d3.js's hexbin plugin at 
// https://github.com/d3/d3-plugins/tree/master/hexbin

// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions
// are met:
//
//    * Redistributions of source code must retain the above copyright
//  notice, this list of conditions and the following disclaimer.
//
//    * Redistributions in binary form must reproduce the above
//  copyright notice, this list of conditions and the following
//  disclaimer in the documentation and/or other materials provided
//  with the distribution.
//
//    * The name Michael Bostock may not be used to endorse or promote
//  products derived from this software without specific prior written
//  permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
// "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
// LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS
// FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL MICHAEL
// BOSTOCK BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
// EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
// PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
// PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
// OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE
// USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH
// DAMAGE.

(function() {

// rotated hexbin - rows are staggered instead of columns

// All of my changes from original hexbin are demarcated by
// comments that say "NOTE:"

// NOTE: changed first param to range from 0 to -Math.PI / 6.
var d3_hexbinAngles = d3.range(-Math.PI / 6, 2 * Math.PI, Math.PI / 3),
    d3_hexbinX = function(d) { return d[0]; },
    d3_hexbinY = function(d) { return d[1]; };

// NOTE: changed external name to rhexbin.
d3.rhexbin = function() {
  var width = 1,
      height = 1,
      r,
      x = d3_hexbinX,
      y = d3_hexbinY,
      dx,
      dy;

  function hexbin(points) {
    var binsById = {};

    points.forEach(function(point, i) {
      var py = y.call(hexbin, point, i) / dy, pj = Math.round(py),
          px = x.call(hexbin, point, i) / dx - (pj & 1 ? .5 : 0), pi = Math.round(px),
          py1 = py - pj;

      if (Math.abs(py1) * 3 > 1) {
        var px1 = px - pi,
            pi2 = pi + (px < pi ? -1 : 1) / 2,
            pj2 = pj + (py < pj ? -1 : 1),
            px2 = px - pi2,
            py2 = py - pj2;
        if (px1 * px1 + py1 * py1 > px2 * px2 + py2 * py2) pi = pi2 + (pj & 1 ? 1 : -1) / 2, pj = pj2;
      }

      var id = pi + "-" + pj, bin = binsById[id];
      if (bin) bin.push(point); else {
        bin = binsById[id] = [point];
        bin.i = pi;
        bin.j = pj;
	// NOTE: I bet I need to fix this stuff too. Good thing I'm
	// not using binning.
        bin.x = (pi + (pj & 1 ? 1 / 2 : 0)) * dx;
        bin.y = pj * dy;
      }
    });

    return d3.values(binsById);
  }

  function hexagon(radius) {
    var x0 = 0, y0 = 0;
    return d3_hexbinAngles.map(function(angle) {
      var x1 = Math.sin(angle) * radius,
          y1 = -Math.cos(angle) * radius,
          dx = x1 - x0,
          dy = y1 - y0;
      x0 = x1, y0 = y1;
      return [dx, dy];
    });
  }

  hexbin.x = function(_) {
    if (!arguments.length) return x;
    x = _;
    return hexbin;
  };

  hexbin.y = function(_) {
    if (!arguments.length) return y;
    y = _;
    return hexbin;
  };

  hexbin.hexagon = function(radius) {
    if (arguments.length < 1) radius = r;
    return "m" + hexagon(radius).join("l") + "z";
  };

  hexbin.centers = function() {
    var centers = [];
    // NOTE: swapped x and y.
    for (var x = 0, odd = false, i = 0; x < width + r; x += dx, odd = !odd, ++i) {
      for (var y = odd ? dy / 2 : 0, j = 0; y < height + dy / 2; y += dy, ++j) {
        var center = [x, y];
        center.i = i;
        center.j = j;
        centers.push(center);
      }
    }
    return centers;
  };

  hexbin.mesh = function() {
    var fragment = hexagon(r).slice(0, 4).join("\nl");
    // NOTE: Added extra fragments and the if in the map below.
    var second_to_last_row_fragment = hexagon(r).slice(0, 5).join("\nl");
    var last_row_fragment = hexagon(r).slice(0, 6).join("\nl");
    return hexbin.centers().map(function(p) {
	if (Math.abs(p[1] - height) < 0.0001) {
	    return "M" + p + "\nm" + last_row_fragment + "\n";
	} else if (Math.abs(p[1] - (height - dy / 2)) < 0.0001) {
	    return "M" + p + "\nm" + second_to_last_row_fragment + "\n";
	} else {
	    return "M" + p + "\nm" + fragment + "\n";
	}
    }).join("");
  };

  hexbin.size = function(_) {
    if (!arguments.length) return [width, height];
    width = +_[0], height = +_[1];
    return hexbin;
  };

  hexbin.radius = function(_) {
    if (!arguments.length) return r;
    r = +_;
    // NOTE: swapped dx and dy
    dy = r * 2 * Math.sin(Math.PI / 3);
    dx = r * 1.5;
    return hexbin;
  };

  hexbin.dx = function() { return dx; }
  hexbin.dy = function() { return dy; }

  return hexbin.radius(1);
};

})();
