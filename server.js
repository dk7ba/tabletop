const server = require('express')();
const http = require('http').createServer(server);
const io = require('socket.io')(http);


io.on('connection', function(socket) {
    console.log('A user connected: ' + socket.id);

    let players = {};

    let player = "new Player(name)"; // Create player class to store player info for client-server interaction

    players[socket.id] = player;

    socket.on('send', function(text)  {
        let userText = "<" + socket.id + "> " + text;
        if (text === 'card') {
            io.emit('create', 130, 180);
        };
        if (text === 'token') {
            io.emit('create', 100, 100);
        };
        io.emit('receive', userText);
    });

    socket.on('disconnect', function() {
        delete players[socket.id];
        console.log('A user disconnected: ' + socket.id);
    });
});

http.listen(3000, function() {
    console.log('Server started!');
});
