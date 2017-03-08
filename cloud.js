var express = require('express');
var path = require('path');
var _ = require('underscore');
var app = express();

app.get('/', function (req, res) {
	res.sendFile(path.resolve(__dirname, 'index.html'));
});


app.use('/css', express.static(path.join(__dirname, '/css')));
app.use('/js', express.static(path.join(__dirname, '/js')));
app.use('/data', express.static(path.join(__dirname, '/data')));


// start up the server on port 3000
var server = app.listen(process.env.PORT || 3000, function() {
	console.log('Express Server running on port %s', this.address().port);
});