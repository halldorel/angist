var guessInput = document.getElementById("guessInput");
var messageTextArea = document.getElementById("messageTextArea");

var colors = {
    blue     : 'rgb(92, 140, 201)',
    teal     : 'rgb(69, 214, 187)', 
    yellow   : 'rgb(224, 212, 85)',
    purple   : 'rgb(224, 134, 232)',
    red      : 'rgb(248, 113, 113)',
    babyblue : 'rgb(110, 201, 241)',
    black    : 'rgb(0, 0, 0)'
    };
    
    //+ Jonas Raoni Soares Silva
    //@ http://jsfromhell.com/array/shuffle [v1.0]
function shuffle(o){ 
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
}