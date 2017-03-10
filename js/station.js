window.graphLineState = {
	"focus": "mBar",

	"Temp" : {
		"isActive" : false,
		"focus"  : false,
		"label" : "Temperature (F)",
		"domain": [0, 100]
	},
	"rHum" : {
		"isActive" : false,
		"focus"  : false,
		"label" : "Relative Humidity (%)",
		"domain": [0, 100]
	},
	"mBar" : {
		"isActive" : true,
		"focus"  : true,
		"label" : "Barometric Pressure (mBar)",
		"domain": [990, 1030]
	},
	"Wind" : {
		"isActive" : false,
		"focus"  : false,
		"label" : "Wind Speed (mph)",
		"domain": [0, 40]
	},

	"showBaroLineText" : true
}


function updateGraphLineState (e) {

	var id = $(e.target).attr('id').replace('Btn','');
	window.graphLineState[id].isActive = !window.graphLineState[id].isActive;
	window.graphLineState[window.graphLineState.focus].focus = false;
	

	if (!window.graphLineState[id].isActive && $('.active').length) {
		id = $('.active').first().attr('id').replace('Btn','');
	}

	window.graphLineState[id].focus = true;
	window.graphLineState.focus = id;

	update();
}


var	winW = $('#station').innerWidth();
var	winH = ( $('#station').innerWidth() * .75 > $(window).innerHeight() ) ? 
			$(window).innerHeight() : 
			$('#station').innerWidth() * .75;

$('#station').append('<svg height="' + winH + '" width="' + winW + '"></svg>');


var svg = d3.select("svg"),
		margin = {top: 20, right: 21, bottom: 10, left: 48},
		width = +svg.attr("width") - margin.left - margin.right,
		height = +svg.attr("height") - margin.top - margin.bottom,
		g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
var parseTime = d3.timeParse('%Y:%m:%d:%H:%M:%S');


var x = d3.scaleTime().rangeRound([0, width]);
var y = d3.scaleLinear().range([height, 0]);

var TempY = d3.scaleLinear().range([height, 0]);
var rHumY = d3.scaleLinear().range([height, 0]);
var mBarY = d3.scaleLinear().range([height, 0]);
var WindY = d3.scaleLinear().range([height, 0]);
	
var tLine = d3.line().y(function(d) { return TempY(d.Temp); }).x(function(d) { return x(d.Time); }); // mBar
var rLine = d3.line().y(function(d) { return rHumY(d.rHum); }).x(function(d) { return x(d.Time); }); // mBar
var mLine = d3.line().y(function(d) { return mBarY(d.mBar); }).x(function(d) { return x(d.Time); }); // mBar
var wLine = d3.line().y(function(d) { return WindY(d.Wind); }).x(function(d) { return x(d.Time); }); // mBar
	// .y(function(d) { return y(d.Temp); }) // Temp

var xAxis, yAxis, baroLine, mBarLine, TempLine, rHumLine, WindLine;











function handleLineClick () {
	var id = ($(this).attr('class')).replace('Line', '');
	window.graphLineState[window.graphLineState.focus].focus = false;
	window.graphLineState.focus = id;
	window.graphLineState[id].focus = true;
	update();
}


function update(data) {
	if (!window.data) window.data = data;
	if (!data) data = window.data;

	data = data.sort(function (a, b) { return a.Time - b.Time; });
	x.domain(d3.extent(data, function(d) { return d.Time; }));

	$('svg > g').empty();
	
	y.domain(window.graphLineState[window.graphLineState.focus].domain);

	if (window.graphLineState.Wind.isActive) {
		WindLine = g.append("path").attr("class", "WindLine")
		.datum(data)
		.attr("fill", "none")
		.attr("stroke", "lightblue")
		.attr("stroke-width", (window.graphLineState.Wind.focus ? 3 : 1.5))
		.attr("stroke-linecap", "round")
		.attr("stroke-linejoin", "round")
		.attr("d", wLine);
	}

	if (window.graphLineState.Temp.isActive) {
		TempLine = g.append("path").attr("class", "TempLine")
		.datum(data)
		.attr("fill", "none")
		.attr("stroke", "darkorange")
		.attr("stroke-width", (window.graphLineState.Temp.focus ? 3 : 1.5))
		.attr("stroke-linecap", "round")
		.attr("stroke-linejoin", "round")
		.attr("d", tLine);
	}

	if (window.graphLineState.rHum.isActive) {
		rHumLine = g.append("path").attr("class", "rHumLine")
		.datum(data)
		.attr("fill", "none")
		.attr("stroke", "steelblue")
		.attr("stroke-width", (window.graphLineState.rHum.focus ? 3 : 1.5))
		.attr("stroke-linecap", "round")
		.attr("stroke-linejoin", "round")
		.attr("d", rLine);
	}

	if (window.graphLineState.mBar.isActive) {
		// Actual line for mBar
		mBarLine = g.append("path").attr("class", "mBarLine")
		.datum(data)
		.attr("fill", "none")
		.attr("stroke", "lightcoral")
		.attr("stroke-width", (window.graphLineState.mBar.focus ? 3 : 1.5))
		.attr("stroke-linecap", "round")
		.attr("stroke-linejoin", "round")
		.attr("d", mLine)
		.on("click", handleLineClick)
		;

		if (window.graphLineState.mBar.focus) {
			// Avg mBar line
			baroLine = g.append("line").attr("class", "baroAvg")
			.attr("x1", "0").attr("y1", "0")
			.attr("x2", width).attr("y2", "0")
			.attr("transform", "translate(0," + mBarY(1013.25) + ")")
			.attr("stroke", 'lightcoral').attr("opacity", .5)
			.attr("stroke-width", "1")
			.attr("stroke-dasharray", "5, 5");
		}


		if (window.graphLineState.mBar.focus) {

			var baroText = g.append("g").attr("class", "baroAvgTextWrap")
			.attr("fill", 'white')
			.attr("transform", "translate(100," + mBarY(1013.25) + ")")
			
			.append("text").attr("class", "baroAvgText")
			.attr("fill", 'lightcoral')
			.attr("dy", "8px")
			.attr("text-anchor", "end")
			.attr("font-size", "8px")
			.text("(mBar @ sealevel)");
		}
			

	}

	// Bottom Axis
	xAxis = g.append("g").attr('class', 'xAxis')
		.attr("transform", "translate(0," + (height - margin.bottom) + ")")
		.call(d3.axisBottom(x).ticks(5));


	var textOffset = window.graphLineState.mBar.focus ? -45 : -36;
	// Left Axis
	yAxis = g.append("g")
		.call(d3.axisLeft(y))
		.append("text")
		.attr("fill", '#000')
		.attr("transform", "rotate(-90) translate(" + -height/2 + ",0)")
		.attr("y", textOffset)
		.attr("dy", "0.71em")
		.attr("text-anchor", "middle")
		.text(window.graphLineState[window.graphLineState.focus].label);
}
// var timelineCutoffHours = 72;
function responseHandler (d) {
	var	viewModel = [];
	if (typeof d === "string") d = d3.tsvParse(d);


	for (var i = 0; i < d.length; i++) {
		if (d[i].mBar ) {
			viewModel.push({
				Time : parseTime(d[i].Time),
				mBar : +d[i].mBar,
				Temp : +d[i].Temp,
				rHum : +d[i].rHum,
				Wind : +d[i]["Wind Speed"]
			});
		}
			
			
	}
	mBarY.domain(window.graphLineState.mBar.domain);
	TempY.domain(window.graphLineState.Temp.domain);
	rHumY.domain(window.graphLineState.rHum.domain);
	WindY.domain(window.graphLineState.Wind.domain);

	update(viewModel);
}

// d3.tsv("/data.tsv", parseData, update);
$.get("./data3.tsv", responseHandler);

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

	self.onLineControlTap = function (e) {
		e.preventDefault();
		$(e.target).toggleClass('active');
		updateGraphLineState(e);
	}

	self.onTimeControlTap = function (e) {
		e.preventDefault();
	}

	self.handleNavClick = function (e) {
		e.preventDefault();
		$('body').toggleClass('nav');
	}

	self.onBtnRdoClick = function (e) {
		if ( $('.checkB input:checked').length && $('.radio input:checked').length ) {
			$('#formBtn').removeClass('notReady').addClass('ready');
		} else {
			$('#formBtn').attr('class', 'notReady');
		}
	}

	self.handleFormButtonClick = function (e) {
		e.preventDefault();

		switch ($(e.target).attr('class')) {
			case "waiting": 
				$('#formQuestionsWrapper').slideDown(300);
				$(e.target).removeClass('waiting').addClass('notReady');
				$(e.target).text('Submit');
				$('.checkB, .radio').on('click', self.onBtnRdoClick);
			break;
			case "notReady":

			break;
			case "ready":
				$('#formQuestionsWrapper').slideUp(300);
				$(e.target).removeClass('ready').addClass('waiting');
				$(e.target).text('Log Discomfort');
				$('.checkB, .radio').off('click', self.onBtnRdoClick);
				window.setTimeout(function(){ $('.checkB input, .radio input').prop('checked', false); }, 300);
			break;
		}
	}

	$('#controls ul li a').on('click', self.onLineControlTap);
	$('#burger, #closeNav').on('click', self.handleNavClick);
	$('#formBtn').on('click', self.handleFormButtonClick);
	// $('#burger, #closeNav').on('click', self.handleNavClick);
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
