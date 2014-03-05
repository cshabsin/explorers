var bodyContents = "[";

for (var i = 0; i < cols; i++) {
    for (var j = 0; j < rows; j++) {
	var json = hexArray[i][j].toJson();
	if (json) {
	    bodyContents += JSON.stringify(json) + ",<br>";
	}
    }
}

for (var i = 0; i < spinyRatPath.length; i++) {
    bodyContents += JSON.stringify(spinyRatPath[i].toJson()) + "<br>";
}

bodyContents += "]";

$("body").append("<p>").html(bodyContents);
