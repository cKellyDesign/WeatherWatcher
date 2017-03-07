var Station = function () {
	var self = this,
		winW = $(window).innerWidth(),
		winH = $(window).innerWidth() * .75;
		self.weatherData = [];

	self.el = document.getElementById('station');
	$(self.el).append('<svg height="' + winH + '" width="' + winW + '"></svg>');
	// console.log($el.inner)
	// $.get("./data/responseData.tsv", function (data) {
		
	// 	var headerKey = ["Time", "RHum", "Temp", "Wind Direction", "Wind Speed", "Gust", "Rain", "Radiation", "mBar"];
	// 	var dataEl = data.slice(data.indexOf("<PRE>"));
	// 	var dataStr = $(dataEl).text();
	// 	var dataStrIndex = dataStr.split('\n', 4).join('\n').length;
	// 	dataStr = dataStr.slice(dataStrIndex);

	// 	var tabbedData = tabulateUWdata(dataStr);
	// 	tabbedData = "Time	RHum	Temp	Wind Direction	Wind Speed	Gust	Rain	Radiation	mBar" + tabbedData;
	// 	// var splitData = tabbedData.split('\n');


	// 	// for (var r = 2; r < splitData.length; r++) {
	// 	// 	var splitRow = splitData[r].split('\t');
	// 	// 	var newDatum = {};
	// 	// 	for (var c = 0; c < splitRow.length; c++) {
	// 	// 		newDatum[headerKey[c]] = (headerKey[c] !== "Time") ? Number(splitRow[c]) : splitRow[c];
	// 	// 	}
	// 	// 	self.weatherData.push(newDatum);
	// 	// }
		
	// 	// console.log(self.weatherData[101]);
	// 	// window.weatherData = headerStrs + '\n' + tabbedData;
	// 	// makeGraph(d3.tsvParse(tabbedData));
	// });

	var svg = d3.select("svg"),
		margin = {top: 20, right: 20, bottom: 20, left: 40},
		width = +svg.attr("width") - margin.left - margin.right,
		height = +svg.attr("height") - margin.top - margin.bottom,
		g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	var parseTime = d3.timeParse('%H:%M:%S');

	var x = d3.scaleTime()
		.rangeRound([0, width]);

	var y = d3.scaleLinear()
		// .rangeRound([height, 0]);
		.domain([980, 1030]).range([height, 0]);

	var line = d3.line()
		.x(function(d) { return x(d.Time); })
		.y(function(d) { return y(d.mBar); });


		d3.tsv("data/20170306.tsv", function (d) {
			d.Time = parseTime(d.Time);
			d.mBar = +d.mBar;
			return d;

		}, function (error, data) {
			if (error) throw error;



			x.domain(d3.extent(data, function(d) { return d.Time; }));
			// y.domain(d3.extent(data, function(d) { return d.mBar; }));
			// y.domain("850", "1030");

			// Bottom Axis
			g.append("g")
				.attr("transform", "translate(0," + height + ")")
				.call(d3.axisBottom(x))
				.select(".domain")
				.remove();;

			// Left Axis
			g.append("g")
				.call(d3.axisLeft(y))
				.append("text")
				.attr("fill", '#000')
				.attr("transform", "rotate(-90)")
				.attr("y", 6)
				.attr("dy", "0.71em")
				.attr("text-anchor", "end")
				.text("Pressure\n(mBar)");

			// Actual Line
			g.append("path")
				.datum(data)
				.attr("fill", "none")
				.attr("stroke", "steelblue")
				.attr("stroke-linejoin", "round")
				.attr("stroke-linecap", "round")
				.attr("stroke-width", 1.5)
				.attr("d", line);
	});


}



window.station = new Station();

function tabulateUWdata (data) {
	data = data.replace(/            /g, '	');
	data = data.replace(/           /g, '	');
	data = data.replace(/          /g, '	');
	data = data.replace(/         /g, '	');
	data = data.replace(/        /g, '	');
	data = data.replace(/       /g, '	');
	data = data.replace(/      /g, '	');
	data = data.replace(/     /g, '	');
	data = data.replace(/    /g, '	');
	data = data.replace(/   /g, '	');
	data = data.replace(/  /g, '	');
	data = data.replace(/ /g, '	');

	return data;
}
