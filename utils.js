// Pads str to length with leading zeroes
exports.pad = function (str, length) {
    str = '' + str;
    while (str.length < length) {
        str = '0' + str;
    }
    return str;
};