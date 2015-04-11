"use strict";
// Pads str to length with leading zeroes
exports.pad = function (str, length) {
    str = '' + str;
    while (str.length < length) {
        str = '0' + str;
    }
    return str;
};

exports.log_object = function(object) {
    for (var key in object) {
        if (object.hasOwnProperty(key)) {
            console.log(key + " -> " + object[key]);
        }
    }
};
