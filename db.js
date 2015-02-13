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

// TODO:
// Connect to a non-development database when !DEBUG
var db = orm.connect("postgres://:@localhost/angist");
//var db = orm.connect("postgres:///angist");

db.on('connect', function(err, db) {
    if (err) return printError(err);
    console.log('Raungefni í gagnagrunni.');
    console.log('Ný tenging hafin, ' + new Date());

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
            }
        }
    });


    /*****************
     *               *
     *   RELATIONS   *
     *               *
     *****************/

    Word.hasOne('category', Category);


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


});


// Utils
// =============================================================================
function printError(err) {
    return console.error('Vangefni í gagnagrunni ' + err);
}