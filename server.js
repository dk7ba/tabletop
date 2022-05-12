const server = require('express')();
const http = require('http').createServer(server);
const io = require('socket.io')(http);


io.on('connection', function(socket) {
    console.log('A user connected: ' + socket.id);

    let players = {};

    // Store player info.
    players[socket.id] = {
        id: socket.id,
        username: socket.id
    };

    // TODO: Implement player roles

    // Serial ID number for game objects.
    let tokenId = 0;

    socket.on('send', function(text)  {
        // Prevent sending empty messages.
        if (text !== null && text !== "") {
            // TODO: Implement a user command subsystem for users to control chat functions.
            if (text.search('cu') >= 0) {
                players[socket.id].username = text.substring(2).trim();
            };
            if (text === 'token') {
                io.emit('createToken', 'token' + tokenId++, 64, 64);
            };

            io.emit('receive', "<" + players[socket.id].username + "> " + text);
        };
    });

    socket.on('dragging', function(gameObject) {
        socket.broadcast.emit('dragged', gameObject);
    });

    socket.on('disconnect', function() {
        delete players[socket.id];
        console.log('A user disconnected: ' + socket.id);
    });
});

http.listen(3000, function() {
    console.log('Server started!');
});
