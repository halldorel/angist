// Pads str to length with leading zeroes
exports.pad = function(str, length) {
    str = '' + str;
    while (str.length < length)
    {
        str = '0' + str;
    }
    return str;
};

// TODO:
// Offload words_tmp into database.
var words_tmp = ['spjaldhryggur',
                 'þvengur',
                 'stálbrjótur',
                 'brjál-fótur',
                 'þang-maður',
                 'loðber',
                 'bjúgaldin',
                 'vél-maður'];
exports.pickWord = function(category) {
    category = category || 'default';
    return words_tmp[Math.floor(Math.random() * words_tmp.length)];
};