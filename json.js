"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MakeJson = void 0;
function MakeJson(cols, rows, hexArray, spinyRatPath) {
    var bodyContents = "";
    for (var i = 0; i < cols; i++) {
        for (var j = 0; j < rows; j++) {
            var json = hexArray[i][j].toJson();
            if (json) {
                bodyContents += JSON.stringify(json) + "<br>";
            }
        }
    }
    for (var i = 0; i < spinyRatPath.length; i++) {
        bodyContents += JSON.stringify(spinyRatPath[i].toJson()) + "<br>";
    }
    return bodyContents;
}
exports.MakeJson = MakeJson;
// $("body").append("<p>").html(bodyContents);
