var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

// Use this dictionary for server event names 
var events = {
    newPoint: 'newPoint',
    beginPath: 'beginPath',
    closePath: 'closePath',
    sendMsg: 'sendMsg',
    receiveMsg: 'receiveMsg',
    newWord: 'newWord'
};

var socket = io.connect('', {secure: true});

var paths = [];
var currentPath = [];


// Network event handlers
// =============================================================================
socket.on(events.beginPath, function (data) {
    currentPath.push(data);
});

socket.on(events.newPoint, function (data) {
    currentPath.push(data);
});

socket.on(events.closePath, function (data) {
    currentPath.push(data);
    paths.push(currentPath);
    currentPath = [];
});

socket.on(events.newWord, function (data) {
    document.getElementById('current-word').innerText = data.word.word;
});

// TODO: Put in a seperate general Path class
function renderPath(path) {
    if (path.length <= 1) return; // No use in drawing a path that has no segments ;'~P
    ctx.beginPath();
    ctx.moveTo(path[0].x, path[0].y);
    for (var i = 1; i < path.length; i++) {
        ctx.lineTo(path[i].x, path[i].y);
    }
    ctx.stroke();
    ctx.closePath();
}

function widthFromDist(from, to) {
    return Math.min(30 / Math.sqrt(Math.abs(to.x - from.x) + Math.abs(to.y - from.y)), 5);
}

var render = function () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (var i = 0; i < paths.length; i++) {
        renderPath(paths[i]);
    }

    renderPath(currentPath);

    window.requestAnimationFrame(render);
};

function relativeMousePosition(e) {
    var source = canvas.getBoundingClientRect();
    return {
        x: e.clientX - source.left,
        y: e.clientY - source.top
    };
}

var pencilTool = new PencilTool();

// Local event handlers
// =============================================================================
document.addEventListener('mousedown', function (e) {
    pencilTool.mouseDown(relativeMousePosition(e));
});

document.addEventListener('mousemove', function (e) {
    pencilTool.didMoveTo(relativeMousePosition(e));
});

document.addEventListener('mouseup', function (e) {
    pencilTool.mouseUp(relativeMousePosition(e));
});

render();

window.requestAnimationFrame(render);