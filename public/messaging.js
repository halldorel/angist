"use strict";
/********************
 *      Angist      *
 *   messaging.js   *
 ********************/
// Handles message sending and receiving on the front end.

var messages = document.getElementById('responseList');
var textArea = document.getElementById('messageTextArea');
var messageContainer = document.getElementById('message');

// Events out
// =============================================================================

textArea.addEventListener('keyup', function(event) {
    if (event.keyCode == 13) {
        sendMessage(textArea.value);
        textArea.value = '';
    }
});


// Events in
// =============================================================================

socket.on('receiveMsg', function(data) {
    renderMessage(data);
});


// Message utils
// =============================================================================

// Escapes the string in msg and sends it to the server if it is not empty.
function sendMessage(msg) {
    if (msg != '') socket.emit('sendMsg', escapeHTML(msg));
}


function renderMessage(data) {
    var li = document.createElement('li');
    li.innerHTML = '<div class="username">' + data.username + '<span class="timestamp">' + data.time + '</span></div><div class="message">' + data.message + '</div>';
    messages.appendChild(li);
    messages.scrollTop = messages.scrollTop + 300;
}




// Escapes the input string.
// Hack - uses the DOM, but is faster than chaining .replace()
function escapeHTML(string) {
    var pre = document.createElement('pre');
    var text = document.createTextNode(string);
    pre.appendChild(text);
    return pre.innerHTML;
}