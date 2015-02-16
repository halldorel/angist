"use strict";
/**************
 *   Angist   *
 **************/

// Requirements
// =============================================================================
// Libraries
var http = require('http');
var express = require('express');
var socket = require('socket.io');

// Angist modules
var utils = require('./utils');
var db = require('./db');


// Setup
// =============================================================================
var app = express();
var server = http.createServer(app);
var io = socket.listen(server);
// Default to port 3000 if environment does not provide a port number.
var port = process.env.PORT || 3000;


app.set('views', __dirname + '/views');
app.set('title', 'Angist');
app.set('view options', {layout: false});

// Routing
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/views/index.html');
});

app.get('/add-words', function (req, res) {
    res.sendFile(__dirname + '/views/add_words.html');
});

app.use(express.static(__dirname + '/public'));


// Makeshift user mgmt
var users = {};
var numUsers = 0;


server.listen(port);


var currentWord;

// Connection
// =============================================================================
io.on('connection', function(socket) {


    // Temporary:
    // On each new connection we pick a new word and push it to all sockets.
    db.pickWord(function(word) {
        if(word){
            currentWord = word;
            socket.emit('newWord', {word: currentWord});
        } else {
            console.error('Error picking a word, is the database empty?');
        }
    });

    var loggedIn;
    socket.isConnectionDropped = function () {
        if (socket.username === undefined) {
            socket.emit('droppedConnection');
            return true;
        }
        return false;
    };

    socket.on('setUsername', function(username) {
            // If user is changing their name
            if (loggedIn) {
                socket.broadcast.emit('userLeft', {
                    username: socket.username,
                    numUsers: --numUsers
                });
                delete users[socket.id];
            }

            socket.username = username;
            users[socket.id] = {
                id: socket.id,
                username: username
            };

            ++numUsers;
            loggedIn = true;

            // Echo welcoming message locally
            socket.emit('login', {
                username: socket.username,
                users: users,
                numUsers: numUsers
            });
            // Echo to logged-in users
            io.emit('userJoined',
                    {
                        username: socket.username,
                        users: users,
                        numUsers: numUsers
                    },
                    socket.id);
        }
    );

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
        date = date.getHours() + ":" + utils.pad(date.getMinutes(), 2);

        socket.broadcast.emit('message', {
            message: message,
            time: date,
            username: socket.username
        });
        socket.broadcast.emit('stopTyping', {username: socket.username});

        console.log(date + "| " + socket.username + "> " + message);
    });

    socket.on('disconnect', function() {
        // Remove username from global usernames list
        if (loggedIn) {
            socket.broadcast.emit('userLeft', {
                username: socket.username,
                users: users,
                numUsers: --numUsers
            });
            delete users[socket.id];
        }
    });


    socket.on('addWord', function(data) {
        console.log("New word received: " + data.word);
        var word = {
            word: data.word,
            played: 0,
            guessed: 0
        };
        word = db.Word.create(word, function(err, items) {
            if (err) return console.error(err);
            console.log(items);
        });
        //if (data.category != undefined) {
        //    var cat = db.Category.get(data.category);
        //    word.setCategory(cat);
        //    word.save();
        //}
    });
});

// Deprecated?
// =============================================================================
// TODO:
// move to utils
function echoToAll(evt, msg, ext) {
    // Emits event evt with message msg to all connected users, except ext
    for (var u in users)
        if (users[u].id !== ext)
            io.sockets.connected[users[u].id].emit(evt, msg);
}
