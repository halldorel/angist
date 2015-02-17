"use strict";
/*************
 *   Angist  *
 *   db.js   *
 *************/

// Handles connections to the database.
// Defines models.


// Public
// =============================================================================
exports.Word = null;
exports.Category = null;


// Setup
// =============================================================================
var orm = require('orm');

// Connect to a non-development database when NODE_ENV = 'production'
var db;
if (!process.env.NODE_ENV) {
    db = orm.connect("postgres://:@localhost/angist");
} else {
    db = orm.connect(process.env.DATABASE_URL);
}

db.on('connect', function(err, db){
    setUp(err, db)
});

function setUp(err, db) {
    if (err) return printError(err);
    console.log('Raungefni í gagnagrunni.');
    console.log('Ný tenging hafin, ' + new Date());
    db.use(require('orm-random'));
    /*****************
     *               *
     *     MODELS    *
     *               *
     *****************/

    var Category = db.define('category', {
        id: {type: 'serial', key: true},
        name: {type: 'text'}
    });

    var Word = db.define('word', {
        id: {type: 'serial', key: true},
        word: {type: 'text'},
        played: {type: 'number'},
        guessed: {type: 'number'}
    }, {
        methods: {
            difficulty: function () {
                return 1 - (this.guessed / this.played);
            },
            update: function(rightGuess) {
                this.played++;
                if (rightGuess) this.guessed++;
                this.save();
            }
        }
    });


    /*****************
     *               *
     *   RELATIONS   *
     *               *
     *****************/

    Word.hasOne('category', Category, {reverse: 'words'});


    /*****************
     *               *
     * CREATE TABLE  *
     *               *
     *****************/

    Category.sync(function(err) {
        if (err) return printError(err);
        exports.Category = Category;
    });

    Word.sync(function(err) {
        if (err) return printError(err);
        exports.Word = Word;
    });


    /********************
     *                  *
     *  PUBLIC METHODS  *
     *                  *
     ********************/

    exports.pickWord = function(callback) {
        Word.findRandom(function(err, item) {
            if (err) return console.error(err);
            if(item) {
                console.log("Picked a random word: " + item[0].word);
                callback(item[0]);
            } else {
                console.error("Empty word table");
                callback({word: "Empty word table."});
            }
        });
    };
}


// Utils
// =============================================================================
function printError(err) {
    return console.error('Vangefni í gagnagrunni ' + err);
}