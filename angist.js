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

var round   = require('./round');

// User auth
// TODO: Move to another file
/*********/
var passport = require('passport');
var flash    = require('connect-flash');

var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');
/*********/

// Setup
// =============================================================================
var app = express();
app.disable('etag');
var server = http.createServer(app);
var io = socket.listen(server);
// Default to port 3000 if environment does not provide a port number.
var port = process.env.PORT || 3000;


app.set('views', __dirname + '/views');
app.set('title', 'Angist');
app.set('view options', {layout: false});

// User auth
// TODO: Move to another file
/*********/
app.use(morgan('dev'));  // Log all http requests
app.use(cookieParser()); // Cookies for auth
app.use(bodyParser());   // Parsing html forms

app.use(session({secret: 'iamadevelopmentsecretpleasedontusemeinproduction'}));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash());            // Allow flash messages stored in session



// User auth
// =============================================================================

var LocalStrategy = require('passport-local').Strategy;

passport.serializeUser(function(user, callback) {
    callback(null, user[0].id);
});

passport.deserializeUser(function(id, callback) {
    db.User.get(id, function(err, user) {
        callback(err, user);
    });
});

passport.use('local-signup', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    },
    function(req, email, password, callback) {
        console.log("local strategy")
        process.nextTick(function() {
            db.User.find({username: email}, function(err, user) {
                if (err) return callback(err);
                if (user.length) return callback(null, false, req.flash('signupMessage', 'Email address taken'));
                db.User.create({
                     username: email,
                     password: db.generateHash(password)},
                     function(err, user)
                     {
                         if (err) return console.error("YO DIS IS WRUNG: " + err);
                         return console.log(user);
                     });
            });
        });
    }
));

passport.use('local-login', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallBack: true
    },
    function(email, password, callback) {
        console.log(email);
        console.log(password);
        db.User.find({username: email}, function(err, user) {
            if (err) return callback(err);
            console.log(user);
            if(!user.length)
                return callback(null, false);
            if(!user[0].validatePassword(password))
                return callback(null, false);
            return callback(null, user);
        });
    }
));
/*********/

// ===================================
// TODO:
// Offload routing to a separate file.
// ===================================
// Routing
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/views/index.html');
});

app.get('/add-words', function (req, res) {
    res.sendFile(__dirname + '/views/add_words.html');
});

app.get('/login', function(req, res) {
    res.sendFile(__dirname + '/views/login.html');
});

app.post('/login', passport.authenticate('local-login', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}));

app.get('/signup', function(req, res) {
    res.sendFile(__dirname + '/views/signup.html');
});

app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/login',
    failureRedirect: '/signup',
    failureFlash: true
}));


// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
    // If user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // Iff they aren't redirect them to the login page
    res.redirect('/login');
}

app.use(express.static(__dirname + '/public'));

// Makeshift user mgmt
var socketIds = [];
var users = {};
var numUsers = 0;

server.listen(port);

var currentRound = null;
var currentWord;
var currentDrawer = null;





// Connection
// =============================================================================
io.on('connection', function(socket) {
    socketIds.push(socket.id);
    
    function setRandomDrawer() {
        // *bleugh*
        var randomIndex = Math.floor(Math.random() * socketIds.length);
        currentDrawer = socketIds[randomIndex];
        console.log("Current drawer: ", currentDrawer);
    }

    var timerCallback = function(secondsLeft) {
        io.emit("timeUpdate", secondsLeft);
    };
    
    var roundEndedCallback = function(results) {
        io.emit("roundEnded", results);
        console.log("roundEnded", results);
        currentRound = null;
    };

    socket.on('guess', function(guess) {
            console.log(socket.id, "guessed", guess);
        if(currentRound !== null) {
            currentRound.guess(guess);
            io.emit("guess", guess);
        }
        else {
            console.log("Trying to guess in a non-round. Ignoring.");
        }
    });
    
    socket.on('startRound', function() {
        // TODO: Check first if the user can start a round
        console.log("startRound");
        if(currentRound == null) {
            
            setRandomDrawer();
            
            console.log("Starting round ...")
            db.pickWord(function(word) {
                if(word) {
                    currentWord = word;
                    currentRound = round.newRound(currentWord.word, timerCallback, roundEndedCallback);
                    currentRound.start();
                    console.log(currentDrawer);
                    io.to(currentDrawer).emit('newWord', currentWord.word);
                }
                else {
                    console.error("Erroneous attempt at word yielding.")
                }
            });
        }
    });

// Temporary:
// On each new connection we pick a new word and push it to all sockets.
// db.pickWord(function(word) {
//         if(word){
//             currentWord = word;
//             socket.emit('newWord', {word: currentWord});
//         } else {
//             console.error('Error picking a word, is the database empty?');
//         }
//     });

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

    socket.on('colorChange', function(color){
        io.emit('colorChange', color);
    })

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
//         if (loggedIn) {
//             socket.broadcast.emit('userLeft', {
//                 username: socket.username,
//                 users: users,
//                 numUsers: --numUsers
//             });
//             delete users[socket.id];
//         }
        delete users[socket.id];
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
