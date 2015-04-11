"use strict";
/*
 *  Routing strategies for angist.js
 */
module.exports = function(app, express, passport) {
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
};

