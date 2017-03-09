window.graphLineState = {
	"focus": "mBar",

	"Temp" : {
		"isActive" : false,
		"focus"  : false
	},
	"rHum" : {
		"isActive" : false,
		"focus"  : false
	},
	"mBar" : {
		"isActive" : true,
		"focus"  : true
	},
	"Wind" : {
		"isActive" : false,
		"focus"  : false
	}
}

function updateGraphLineState (e) {

	var id = $(e.target).attr('id').replace('Btn','');
	window.graphLineState[id].isActive = !window.graphLineState[id].isActive;
	window.graphLineState[window.graphLineState.focus].focus = false;

	

	if (window.graphLineState[id].isActive) {
		window.graphLineState[id].focus = true;
	} else if ($('.active').length) {
		id = $('.active').first().attr('id').replace('Btn','');
	}

	window.graphLineState.focus = id;

	console.log(window.graphLineState);
	update();
}



var	winW = $('#station').innerWidth();
var	winH = ( $('#station').innerWidth() * .75 > $(window).innerHeight() ) ? $(window).innerHeight() : $('#station').innerWidth() * .75;
$('#station').append('<svg height="' + winH + '" width="' + winW + '"></svg>');

var svg = d3.select("svg"),
		margin = {top: 20, right: 0, bottom: 10, left: 40},
		width = +svg.attr("width") - margin.left - margin.right,
		height = +svg.attr("height") - margin.top - margin.bottom,
		g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
var parseTime = d3.timeParse('%Y:%m:%d:%H:%M:%S');

var x = d3.scaleTime().rangeRound([0, width]);

// var mBarY = d3.scaleLinear().domain([990, 1030]).range([height, 0]);


var TempY= d3.scaleLinear().range([height, 0]);
var rHumY = d3.scaleLinear().range([height, 0]);
var mBarY = d3.scaleLinear().range([height, 0]).domain([990, 1030]);;
var WindY = d3.scaleLinear().range([height, 0]);

function getFocusedYaxis () {
	switch (window.graphLineState.focus) {
		case "Temp":
			return TempY;
		break;
		case "rHum":
			return rHumY;
		break;
		case "mBar": 
			return mBarY;
		break;
		case "Wind":
			return WindY;
		break;
		default:
			return null;
		break;
	}
}


	// .domain([30, 50]) // Temp
	

var line = d3.line()
	.y(function(d) { return mBarY(d.mBar); }) // mBar
	// .y(function(d) { return y(d.Temp); }) // Temp
	.x(function(d) { return x(d.Time); });

var xAxis, yAxis, baroLine, mBarLine;

function update(data) {
	if (!window.data) window.data = data;
	if (!data) data = window.data;

	data = data.sort(function (a, b) { return a.Time - b.Time; });
	x.domain(d3.extent(data, function(d) { return d.Time; }));


	$('svg > g').empty()
	

	// Bottom Axis
	xAxis = g.append("g")
		.attr("transform", "translate(0," + (height - margin.bottom) + ")")
		.call(d3.axisBottom(x));

	// Left Axis
	yAxis = g.append("g")
		.call(d3.axisLeft(getFocusedYaxis()))
		.append("text")
		.attr("fill", '#000')
		.attr("transform", "rotate(-90)")
		.attr("y", 6)
		.attr("dy", "0.71em")
		.attr("text-anchor", "end")
		.text("Pressure (mBar)"); // mBar
		// .text("Temp (F)"); // Temp

	if (window.graphLineState.mBar.isActive) {


		// Actual line for mBar
		mBarLine = g.append("path").attr("class", "mBar")
		.datum(data)
		.attr("fill", "none")
		.attr("stroke", "lightcoral")
		.attr("stroke-width", (window.graphLineState.mBar.focus ? 3 : 1.5))
		.attr("stroke-linecap", "round")
		.attr("stroke-linejoin", "round")
		.attr("d", line);

		// Avg mBar line
		baroLine = g.append("line")
		.attr("x1", "0").attr("y1", "0")
		.attr("x2", width).attr("y2", "0")
		.attr("transform", "translate(0," + mBarY(1013.25) + ")")
		.attr("stroke", 'grey')
		.attr("stroke-width", "1")
		.attr("stroke-dasharray", "5, 5");
	}
}

function responseHandler (d) {
	var	viewModel = [];
	if (typeof d === "string") d = d3.tsvParse(d); 
	for (var i = 0; i < d.length; i++) {
		if (d[i].mBar)
			// debugger;
			viewModel.push({
				Time : parseTime(d[i].Time),
				mBar : +d[i].mBar,
				Temp : +d[i].Temp,
				rHum : +d[i].rHum,
				Wind : +d[i]["Wind Speed"]
			});
	}

	TempY.domain(d3.extent(viewModel, function(d) { return d.Temp; }));
	rHumY.domain(d3.extent(viewModel, function(d) { return d.rHum; }));
	WindY.domain(d3.extent(viewModel, function(d) { return d.Wind; }));

	update(viewModel);
}

// d3.tsv("/data.tsv", parseData, update);
$.get("/data.tsv", responseHandler);

// $.get("data/20170307.tsv", responseHandler);

// $.ajax({
// 	// url: 'https://www.ncdc.noaa.gov/cdo-web/api/v2/datasets',
// 	// url: 'https://www.ncdc.noaa.gov/cdo-web/api/v2/datatypes',
// 	// url: 'https://www.ncdc.noaa.gov/cdo-web/api/v2/datatypes?datacategoryid=TEMP',
// 	url: 'https://www.ncdc.noaa.gov/cdo-web/api/v2/data?datasetid=GHCND',

// 	headers: { token : 'TRTvjDhJZzqgZfiObVEInrGOztJdyVBh' },
// 	complete : function(data) { 
// 		// var results = (JSON.parse(data.responseText)).results[4];
// 		console.log(data.responseJSON);
// 		// for (var i = 0; i < results.length; i++) {
// 		// 	console.log(i + ") " + results[i].name);
// 		// }
		 
// 	}
// })

// function updateGraphFullStop (key) {

// }

  
if (location.search) {

	var newQueryState = {}; // to push to and return
	var query = location.search.substr(1); // remove "?"
	var queryArr = query.split('&'); // split parameters
	for (var q = 0; q < queryArr.length; q++) {
		var items = (queryArr[q]).split('='); // split key value pair
		if (items.length > 1) newQueryState[items[0]] = items[1];
	}
	window.query = newQueryState;
}

var Station = function () {
	var self = this;
	self.el = document.getElementById('station');
	self.appState = {
		query : (function initQueryState() {  
			if (!location.search) return null;

			var newQueryState = {}; // to push to and return
			var query = location.search.substr(1); // remove "?"
			var queryArr = query.split('&'); // split parameters
			for (var q = 0; q < queryArr.length; q++) {
				var items = (queryArr[q]).split('='); // split key value pair
				if (items.length > 1) newQueryState[items[0]] = items[1];
			}
			return newQueryState;
		})
	};
	self.appState = {};
	self.appState.timeline = {
		hrs	: window.query && window.query.hrs ? Number(window.query.hrs) : 72,
		min	: function () { return self.appState.timeline.hrs   * 60; },
		sec	: function () { return self.appState.timeline.min() * 60; },
		mil	: function () { return self.appState.timeline.sec() * 1000; },
		getTimeDomain : function () { 

			var nowTime = (new Date()).getTime();

			return [(nowTime - self.appState.timeline.mil()), nowTime]; 
		}
	};
	
	window.appState = self.appState;
	// debugger;
	// var url = "/data.json?hrs=" + self.appState.timeline.hrs; 
	// console.log(url);
	// $.get(url, responseHandler);

	self.onLineControlTap = function (e) {
		e.preventDefault();
		$(e.target).toggleClass('active');
		updateGraphLineState(e);
	}

	self.onTimeControlTap = function (e) {
		e.preventDefault();
	}

	$('#controls ul li a').on('click', self.onLineControlTap);
	
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
