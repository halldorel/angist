"use strict";
/**************
 *   Angist   *
 **************/

// Requirements
// =============================================================================
var http    = require('http');
var utils   = require('./utils');
var express = require('express');
var socket  = require('socket.io');


// Setup
// =============================================================================
var app = express();
var server = http.createServer(app);
var io = socket.listen(server);
// Default to port 3000 if environment does not provide a port number.
var port = process.env.PORT || 3000;


app.set('views', __dirname + '/views');
app.set('title', 'Angist');
app.set('view options', { layout: false });

// Routing
app.get('/', function(req, res) {
    res.sendFile(__dirname + '/views/index.html');
});

app.use(express.static(__dirname + '/public'));


// Makeshift user mgmt
var users = {};
var numUsers = 0;



server.listen(port);


// Connection
// =============================================================================
io.on('connection', function(socket) {

    var loggedIn = false;
    socket.isConnectionDropped = function() {
        if (socket.username === undefined)
        {
            socket.emit('droppedConnection');
            return true;
        }
        return false;
    };

    socket.on('setUsername', function(username) {
        // If user is changing their name
        if (loggedIn) {
            socket.broadcast.emit('userLeft', {
                username : socket.username,
                numUsers : --numUsers
            })
            delete users[socket.id];
        }
        
        socket.username = username;
        users[socket.id] = {
            id       : socket.id,
            username : username
        };

        ++numUsers;
        loggedIn = true;

        // Echo welcoming message locally
        socket.emit('login', {
            username : socket.username,
            users    : users,
            numUsers : numUsers
        });
        // Echo to logged-in users
        echoToAll('userJoined',
                  {username : socket.username,
                   users    : users,
                   numUsers : numUsers},
                  socket.id);
        }
    );
    
    //setInterval(function () {
    //  socket.broadcast.emit("message", {x: Math.random()*600, y:Math.random()*400});
    //}, 1000);
    
    socket.on('beginPath', function(point) {
        console.log("beginPath: ", point);
        io.emit('beginPath', point);
    });

    socket.on('newPoint', function(point) {
        if (!point) return;
        // TODO:
        // Change to broadcast:
        
        console.log("newPoint: ", point);
        
        io.emit('newPoint', point);
        //socket.emit("newPoint", {
        //    x: Math.random()*600,
        //    y: Math.random()*400
        //});
    });
    
    socket.on('closePath', function(point) {
        console.log("closePath: ", point);
        io.emit('closePath', point);
    });

    // Broadcast when user starts typing
    socket.on('startTyping', function() {
        if (socket.isConnectionDropped()) return;
        socket.broadcast.emit('startTyping', {username: socket.username});
    });

    socket.on('stopTyping', function() {
        socket.broadcast.emit('stopTyping', {username: socket.username});
    });

    socket.on('sendMessage', function(message) {
        if (socket.isConnectionDropped()) return;
        var date = new Date();
        date = dage.getHours() + ":" + utils.pad(date.getMinutes(), 2);

        socket.broadcast.emit('message', {
            message : message,
            time    : date,
            username: socket.username
        });
        socket.broadcast.emit('stopTyping', {username: socket.username});

        console.log(date + "| " + socket.username + "> " + message);
    });

    socket.on('disconnect', function() {
        // Remove username from global usernames list
        if (loggedIn) {
            socket.broadcast.emit('userLeft', {
                username : socket.username,
                users    : users,
                numUsers : --numUsers
            })
            delete users[socket.id];
        }
    });
});

// TODO:
// move to utils
function echoToAll(evt, msg, ext) {
    // Emits event evt with message msg to all connected users, except ext
    for (var u in users)
        if (users[u].id !== ext)
            io.sockets.connected[users[u].id].emit(evt, msg);
}