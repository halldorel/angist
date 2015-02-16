var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

var _lineWidth = 3;
var selectedColor = 'teal';

// Use this dictionary for server event names 
var events = {
    colorChange : 'colorChange',
    newPoint: 'newPoint',
    beginPath: 'beginPath',
    closePath: 'closePath',
    sendMsg: 'sendMsg',
    receiveMsg: 'receiveMsg',
    newWord: 'newWord',
    timeUpdate: 'timeUpdate'
};

var socket = io.connect('', {secure: true});

var paths = [];

function setSelectedColor(color) {
    selectedColor = color;
    currentPath = makeNewPath();
}

function makeNewPath() {
    return {points : [], color : colors[selectedColor]}
}

var currentPath = makeNewPath();

// Network event handlers
// =============================================================================
socket.on(events.beginPath, function (data) {
    currentPath.points.push(data);
});

socket.on(events.newPoint, function (data) {
    currentPath.points.push(data);
});

socket.on(events.closePath, function (data) {
    currentPath.points.push(data);
    paths.push(currentPath);
    currentPath = makeNewPath();
});

var startRoundButton = document.getElementById("startRound");
var timeLeft = document.getElementById("secondsLeft");
var guessInput = document.getElementById("guess");

socket.on(events.timeUpdate, function(newTime){
    timeLeft.innerHTML = newTime;
});

startRoundButton.addEventListener('mouseup', function(e) {
    socket.emit('startRound');
});
    
socket.on(events.newWord, function (data) {
    console.log("new word: ", data);
    document.getElementById('current-word').innerText = data;
});

socket.on(events.colorChange, function(data){
    setSelectedColor(data);
});

// TODO: Put in a seperate general Path class
function renderPath(path) {
    if(path.points.length <= 1) return; // No use in drawing a path that has no segments ;'~P
    ctx.beginPath();
    ctx.lineWidth = _lineWidth;
    ctx.moveTo(path.points[0].x, path.points[0].y);
    ctx.strokeStyle = path.color;
    for(var i = 1; i < path.points.length; i++) {
        ctx.lineTo(path.points[i].x, path.points[i].y);
    }
    ctx.stroke();
    ctx.closePath();
}

function widthFromDist(from, to) {
    return Math.min(30 / Math.sqrt(Math.abs(to.x - from.x) + Math.abs(to.y - from.y)), 5);
}

var render = function () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for(var i = 0; i < paths.length; i++) {
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
canvas.addEventListener('mousedown', function (e) {
    pencilTool.mouseDown(relativeMousePosition(e));
});

canvas.addEventListener('mousemove', function (e) {
    pencilTool.didMoveTo(relativeMousePosition(e));
});

canvas.addEventListener('mouseup', function (e) {
    pencilTool.mouseUp(relativeMousePosition(e));
});

render();
window.requestAnimationFrame(render);