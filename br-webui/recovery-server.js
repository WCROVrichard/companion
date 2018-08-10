const express = require('express');
const app = express();
const SocketIOFile = require('socket.io-file');

var server = app.listen(3000, function() {
	console.log("Server running successfully on Port:3000");
});
var io = require('socket.io')(server);

app.get('/', (req, res, next) => {
	return res.sendFile(__dirname + '/recovery-client/index.html');
});

app.get('/app.js', (req, res, next) => {
	return res.sendFile(__dirname + '/recovery-client/app.js');
});

app.get('/socket.io.js', (req, res, next) => {
	return res.sendFile(__dirname + '/node_modules/socket.io-client/dist/socket.io.js');
});

app.get('/socket.io-file-client.js', (req, res, next) => {
	return res.sendFile(__dirname + '/node_modules/socket.io-file-client/socket.io-file-client.js');
});

app.get('/styles.css', (req,res,next) => {
	return res.sendFile(__dirname + '/recovery-client/styles.css'); // redirect CSS bootstrap
});


io.on('connection', function(socket) {
	console.log('Socket connected.');

	var count = 0;
	var uploader = new SocketIOFile(socket, {
		// uploadDir: {			// multiple directories
		// 	music: 'data/music',
		// 	document: 'data/document'
		// },
		uploadDir: '/mnt/Imagefile',							// simple directory
		// accepts: ['application/octet-stream'],	// chrome and some of browsers checking mp3 as 'audio/mp3', not 'audio/mpeg'
		// maxFileSize: 4294967296, 					// 4 GB. default is undefined(no limit)
		chunkSize: 26214400,						// default is 10240(1KB) 94371840 52428800
		transmissionDelay: 0,						// delay of each transmission, higher value saves more cpu resources, lower upload speed. default is 0(no delay)
		overwrite: false, 							// overwrite file if exists, default is true.
		/*rename: function(filename) {
		 	var split = filename.split('.');	// split filename by .(extension)
		 	var fname = split[0];	// filename without extension
		 	var ext = split[1];

		 	return `${fname}_${count++}.${ext}`;
		}*/
	});
	uploader.on('start', (fileInfo) => {
		console.log('Start uploading');
		console.log(fileInfo);
		socket.emit('terminal output', "\n" + "Start Uploading" + "\n" + "\n");
		socket.emit('terminal output', JSON.stringify(fileInfo, null, 2) + '\n' + '\n');
	});
	uploader.on('stream', (fileInfo) => {
		console.log(`${fileInfo.wrote} / ${fileInfo.size} byte(s)`);
		socket.emit('terminal-output', '\r' + "Progress --> " + Math.round(fileInfo.wrote / fileInfo.size * 100) + " %");
	});
	uploader.on('complete', (fileInfo) => {
		console.log('Upload Complete.');
		console.log(fileInfo);
		socket.emit('terminal output', "\n" + "\n" + "Upload Complete" + "\n");
		socket.emit('terminal output', '\n' + JSON.stringify(fileInfo, null, 2) + '\n');
	});
	uploader.on('error', (err) => {
		console.log('Error!', err);
		socket.emit('terminal output', "\n" + err + "\n");
	});
	uploader.on('abort', (fileInfo) => {
		console.log('Aborted: ', fileInfo);
		socket.emit('terminal output', "\n" + JSON.stringify(fileInfo, null, 2) + "\n");
	});
});

