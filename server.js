const server = require('express')();
const http = require('http').createServer(server);
const io = require('socket.io')(http);


io.on('connection', function(socket) {
    console.log('A user connected: ' + socket.id);

    let players = {};

    players[socket.id] = {
        id: socket.id
    };

    socket.on('send', function(text)  {
        let userText = "<" + socket.id + "> " + text;
        if (text === 'card') {
            let id = randomInt();
            io.emit('create', 'token' + id, 130, 180);
        };
        if (text === 'token') {
            let id = randomInt();
            io.emit('create', 'token' + id, 100, 100);
        };
        io.emit('receive', userText);
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

function randomInt() {
    return Math.random() * (Number.MAX_SAFE_INTEGER - Number.MIN_SAFE_INTEGER) + Number.MIN_SAFE_INTEGER;
}
