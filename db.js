"use strict";
/*************
 *   Angist  *
 *   db.js   *
 *************/

// Handles connections to the database.
// Defines models.


// Setup
// =============================================================================
var orm = require('orm');

// TODO:
// Connect to a non-development database when !DEBUG
var db = orm.connect("postgres://:@localhost/angist");
//var db = orm.connect("postgres:///angist");

db.on('connect', function(err) {
    if (err) return console.error('Vangefni í gagnagrunni: ' + err);
    console.log('Raungefni í gagnagrunni.');
    console.log('Ný tenging hafin, ' + new Date());
});


// Models
// =============================================================================
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

Word.hasOne('category', Category);

var Category = db.define('category', {
    id: {type: 'serial', key: true},
    name: {type: 'text'}
});

// Public
// =============================================================================
exports.Word = Word;
exports.Category = Category;