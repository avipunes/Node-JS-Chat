var express = require('express'),
	app = express();
	server = require('http').createServer(app),
	io = require('socket.io').listen(server),
	users = {};

var port = process.env.PORT || 8080;
server.listen(port);

app.get('/',function(req,res) {
	res.sendfile(__dirname + '/index.html');
});
app.use("/js", express.static(__dirname + '/js'));
app.use("/sounds", express.static(__dirname + '/sounds'));
app.use("/css", express.static(__dirname + '/css'));
app.use("/images", express.static(__dirname + '/images'));

io.sockets.on('connection', function (socket) {

	socket.on('new user', function(data, callback) {
		if (data in users) { 
			callback(false);
		}else{
			callback(true);
			socket.nickname = data;
			users[socket.nickname] = socket;
			io.sockets.emit('new user', 'Has connected', socket.nickname);
			updateNicknames();
		}
	});

	function updateNicknames() {
		io.sockets.emit('usernames',Object.keys(users));
	}

	socket.on('send message', function(data, callback) {
		data = data.replace(/</g,'&lt;');
		data = data.replace(/>/g,'&gt;');
		var msg = data.trim();
		if (msg.substr(0,2) === '/w') {
			msg = msg.substr(3)
			var ind = msg.indexOf(', ');
			if (ind != -1) {
				var name = msg.substr(0, ind);
				var msg = msg.substr(ind + 1);
				if(name in users){
					users[name].emit('whisper', msg, socket.nickname, socket.img);
				}else{
					callback('Error no such user.')
				}
			}else{
				callback('Error Please enter a message for your whisper.');
			}
		}else{
			io.sockets.emit('new message', data, socket.nickname, socket.img);
		}

	});
	socket.on('facebook data', function(data, callback) {
		socket.img = data.picture.data.url;
		users[socket.img] = socket.img;
	});

	socket.on('disconnect', function(data){
		if (!socket.nickname) return;
		io.sockets.emit('user disconnect', 'Has disconnect', socket.nickname);
		delete users[socket.nickname];
		delete users[socket.img];
		updateNicknames();
	});
});