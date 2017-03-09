var express = require('express');
var path = require('path');
var url = require('url');
var request = require('request');
var _ = require('underscore');
var app = express();

app.get('/', function (req, res) {
	res.sendFile(path.resolve(__dirname, 'index.html'));
});

app.use('/css', express.static(path.join(__dirname, '/css')));
app.use('/js', express.static(path.join(__dirname, '/js')));
app.use('/data', express.static(path.join(__dirname, '/data')));


// var dataHandlers = [dataHandler, latestDataQuery, responseHandler];
// var dataHandlers = [dataHandler, latestDataQuery, datedDataQuery,datedDataQuery,datedDataQuery,datedDataQuery,datedDataQuery,datedDataQuery, responseHandler]
var dataHandlers = [dataHandler, datedDataQuery,datedDataQuery,datedDataQuery,datedDataQuery,datedDataQuery,datedDataQuery, responseHandler]


app.get('/data.json', dataHandlers);
var dateIndex = 0; //

// start up the server on port 3000
var server = app.listen(process.env.PORT || 3000, function() {
	console.log('Express Server running on port %s', this.address().port);
});

// var noaaAPItoken = 'TRTvjDhJZzqgZfiObVEInrGOztJdyVBh';


function dataHandler (req, res, next) {
	// console.log('dataHandler');
	// res.newMessage = "hello world";

	var url_parts = url.parse(req.url, true);
	var query = url_parts.query;
	res.thisQuery = query;
	console.log(res.thisQuery.hrs);
	res.thisQuery.hrs = (res.thisQuery.hrs && res.thisQuery.hrs > 24) ? res.thisQuery.hrs : 24;
	res.bodyToReturn = [];
	// res.thisQuery.days = res.thisQuery.hrs / 24;
	next();
}

function latestDataQuery (req, res, next) {

	request('https://www.atmos.washington.edu/cgi-bin/latest_uw.cgi', function (err, resp, body) {
		if (err) return (res.send(err));

		var dataStrIndex = body.split('\n', 11).join('\n').length;
		// dataStr = dataStr.slice(dataStrIndex);
		body = body.slice(dataStrIndex);
		body = body.replace('\n</PRE>', '');
		body = "Time	RHum	Temp	Wind Direction	Wind Speed	Gust	Rain	Radiation	mBar\n" + body; 
		// console.log(body);

		var dateCurrPre = (new Date()).getFullYear() + ":" + (new Date()).getMonth() + ":" + (new Date()).getDate() + ":";
		res.bodyToReturn = tabulateUWdata(body, dateCurrPre);

		next();
	});
}

function makeDateQueryStr () {
	var yesterdayTime = new Date();
	// yesterdayTime.setDate(yesterdayTime.getHours() + 8);
	// 
	if (!dateIndex && yesterdayTime.getHours() <= 16) {
		yesterdayTime.setDate(yesterdayTime.getDate() - 1);
	}
	// var yesterdayTime = new Date((new Date()).getTime() - (dateIndex * 24 * 60 * 60 * 1000));
	var queryStr = "" + yesterdayTime.getFullYear() + (yesterdayTime.getMonth() < 10 ? "0" : "") + yesterdayTime.getMonth() + (yesterdayTime.getDate() < 10 ? "0" : "") + yesterdayTime.getDate();
	// console.log(queryStr);
	return [queryStr, yesterdayTime];
}

function datedDataQuery (req, res, next) {
	console.log('dateIndex', dateIndex)
	if (dateIndex && res.thisQuery.hrs && res.thisQuery.hrs < dateIndex * 24) {
		console.log('skipped', dateIndex * 24);
		next();
		return;
	}

	var queryStr = makeDateQueryStr();
	var yesterdayTime = queryStr[1];

	request('https://www.atmos.washington.edu/cgi-bin/uw.cgi?' + queryStr[0], function (err, resp, body) {
		if (err) return (res.send(err));

		var dataStrIndex = body.split('\n', 11).join('\n').length;
		// dataStr = dataStr.slice(dataStrIndex);
		body = body.slice(dataStrIndex);
		body = body.replace('\n</PRE>', '');
		body = "Time	RHum	Temp	Wind Direction	Wind Speed	Gust	Rain	Radiation	mBar\n" + body; 
		// console.log(body);
		
		var dateCurrPre = (new Date(yesterdayTime)).getFullYear() + ":" + (new Date(yesterdayTime)).getMonth() + ":" + (new Date(yesterdayTime)).getDate() + ":";
		var yesterdayData = tabulateUWdata(body, dateCurrPre);
		res.bodyToReturn = res.bodyToReturn.concat(yesterdayData);
		dateIndex++;
		next();
	});

}

function responseHandler (req, res, next) {
	dateIndex = 0;
	res.json(res.bodyToReturn)
}


function tabulateUWdata (data, timePreStr) {
	data = data.replace(/            /g, '\t');
	data = data.replace(/           /g, '\t');
	data = data.replace(/          /g, '\t');
	data = data.replace(/         /g, '\t');
	data = data.replace(/        /g, '\t');
	data = data.replace(/       /g, '\t');
	data = data.replace(/      /g, '\t');
	data = data.replace(/     /g, '\t');
	data = data.replace(/    /g, '\t');
	data = data.replace(/   /g, '\t');
	data = data.replace(/  /g, '\t');
	// data = data.replace(/ /g, '\t');

	

	var lines = data.split('\n');
	var result = [];
	var headers = lines[0].split('\t');

	for (var i = 3; i < lines.length; i++) {
		var obj = {};
		var currLine = lines[i].split('\t');
		for (var l = 0; l < currLine.length; l++) {
			obj[headers[l]] = headers[l] === "Time" ? timePreStr + currLine[l] : currLine[l];
		}
		result.push(obj);
	}

	return result;
}