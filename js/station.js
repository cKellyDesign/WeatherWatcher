var Station = function () {
	var self = this,
		$el = $('#station');

	$.get("./data.tsv", function (data) {
		console.log(data);
	});

}

window.station = new Station();