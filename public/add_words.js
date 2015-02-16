var form = document.getElementById('word-form');
var input = document.getElementById('word');
var socket = io.connect('', {secure: true});
form.addEventListener('submit', function(event) {
    event.preventDefault();
    var word = input.value;
    input.value = '';
    socket.emit('addWord', {word: word});
}, false);