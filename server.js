const server = require('express')();
const http = require('http').createServer(server);
const io = require('socket.io')(http);

io.on('connection', function(socket) {
    console.log('A user connected: ' + socket.id);

    socket.on('send', function(text)  {
        let userText = "<" + socket.id + "> " + text;
        io.emit('receive', userText);
    });

    socket.on('disconnect', function() {
        console.log('A user disconnected: ' + socket.id);
    });
});

http.listen(3000, function() {
    console.log('Server started!');
});
