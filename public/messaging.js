"use strict";
/********************
 *      Angist      *
 *   messaging.js   *
 ********************/
// Handles message sending and receiving on the front end.

var msgInput = document.getElementById('msgInput');
var msgSend = document.getElementById('msgSend');
var messages = document.getElementById('messages');

// Events out
// =============================================================================

msgSend.addEventListener('click', function () {
    sendMessage(msgInput.value);
    msgInput.value = '';
});

// Events in
// =============================================================================

socket.on(events.receiveMsg, function (data) {
    renderMessage(data);
});


// Message utils
// =============================================================================

// Escapes the string in msg and sends it to the server if it is not empty.
function sendMessage(msg) {
    if (msg != '') socket.emit(events.sendMsg, escapeHTML(msg);
}


function renderMessage(data) {
    var msgString = data.time + '| ' + data.user + ': ' + data.msg;
    messages.appendChild(msgString)
}


// Escapes the input string.
// Hack - uses the DOM, but is faster than chaining .replace()
function escapeHTML(string) {
    var pre = document.createElement('pre');
    var text = document.createTextNode(string);
    pre.appendChild(text);
    return pre.innerHTML;
}