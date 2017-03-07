var Station = function () {
	var self = this;
	self.el = document.getElementById('station');
	var	winW = $(self.el).innerWidth();
	var	winH = ( $(self.el).innerWidth() * .75 > $(window).innerHeight() ) ? $(window).innerHeight() : $(self.el).innerWidth() * .75;
	self.weatherData = [];

	// Parse URL for query states
	self.queryState = {};
	if (location.search) {
		var query = location.search.substr(1);
		var queryArr = query.split('&');
		for (var q = 0; q < queryArr.length; q++) {
			var items = (queryArr[q]).split('=');
			if (items.length > 1) self.queryState[items[0]] = items[1];
		}
	}

	self.timelineState = {
		hrs	: self.queryState.hrs ? Number(self.queryState.hrs) : 72,
		min	: function () { return self.timelineState.hrs   * 60; },
		sec	: function () { return self.timelineState.min() * 60; },
		mil	: function () { return self.timelineState.sec() * 1000; },
		timeLimit : function () { 

			var nowDate = (new Date()).getTime();

			return nowDate - self.timelineState.mil(); 
		}
	};

	
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
	

	var parseTime = d3.timeParse('%Y:%m:%d:%H:%M:%S');

	var x = d3.scaleTime()
		.rangeRound([0, width]);

	var y = d3.scaleLinear()
		// .rangeRound([height, 0]);
		.domain([990, 1020]) // mBar
		// .domain([30, 50]) // Temp
		.range([height, 0]);

	var line = d3.line()
		.y(function(d) { return y(d.mBar); }) // mBar
		// .y(function(d) { return y(d.Temp); }) // Temp
		.x(function(d) { return x(d.Time); });

	self.d3State = {
		svg		: 	svg,
		width	: 	width,
		height 	: 	height,
		x 		: 	x,
		y 		: 	y,
		line: 	line,

		setyDomain : function () {

			self.d3State.y.domain([890, 1120]);
			console.log(self.d3State.svg.selectAll("g .y.axis").call(d3.axisLeft(self.d3State.y)));
				// .call(d3.axisLeft(self.d3State.y));
			// debugger;
			// self.yAxis = g.append("g")
			// 	.call(d3.axisLeft(y))
			// 	.append("text")
			// 	.attr("fill", '#000')
			// 	.attr("transform", "rotate(-90)")
			// 	.attr("y", 6)
			// 	.attr("dy", "0.71em")
			// 	.attr("text-anchor", "end")
			// 	.text("Pressure\n(mBar)");
		}
	};

	self.makeGraph = function () {

		d3.tsv("data.tsv", function (d) {

				var datumTime 	= (new Date(parseTime(d.Time))).getTime();
				var timeLimit	= self.timelineState.timeLimit();

				if ( datumTime > timeLimit ) {
					return {
						Time : parseTime(d.Time),
						mBar : +d.mBar,
						Temp : +d.Temp
					};
				}

		}, function (error, data) {
			if (error) throw error;
			$('svg > g').empty();

			data = data.sort(function (a, b) { return a.Time - b.Time; });

			x.domain(d3.extent(data, function(d) { return d.Time; }));

			// Bottom Axis
			self.xAxis = g.append("g")
				.attr("transform", "translate(0," + (height - margin.bottom) + ")")
				.call(d3.axisBottom(x));

			g.append("line")
				.attr("x1", "0").attr("y1", "0")
				.attr("x2", width).attr("y2", "0")
				.attr("transform", "translate(0," + y(1013.25) + ")")
				.attr("stroke", 'grey')
				.attr("stroke-width", "1")
				.attr("stroke-dasharray", "5, 5");
				// .attr("height", "2")
				// .attr("width", width);

			// Left Axis
			self.yAxis = g.append("g")
				.call(d3.axisLeft(y))
				.append("text")
				.attr("fill", '#000')
				.attr("transform", "rotate(-90)")
				.attr("y", 6)
				.attr("dy", "0.71em")
				.attr("text-anchor", "end")
				.text("Pressure (mBar)"); // mBar
				// .text("Temp (F)"); // Temp

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
	} // end of makeGraph()

	self.makeGraph();
} // end of Station



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
