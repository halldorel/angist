var canvas = document.getElementById("canvas");
var previewCanvas = document.getElementById("previewCanvas");

var ctx = canvas.getContext("2d");
var preview = previewCanvas.getContext("2d");

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
    timeUpdate: 'timeUpdate',
    guess: 'guess',
    undoLastLine: 'undoLastLine',
    increaseLineWidth: 'increaseLineWidth',
    decreaseLineWidth: 'decreaseLineWidth',
    startRound: 'startRound'
};

var socket = io.connect('', {secure: true});

var paths = [];

function undoLastLine() {
    paths.splice(-1,1);
}

function increaseLineWidth(){
    if (_lineWidth<10) {
        _lineWidth++;
        currentPath = makeNewPath();
    }
    
}

function decreaseLineWidth(){
    if (_lineWidth>1) {
        _lineWidth--;
        currentPath = makeNewPath();
    }
}

function setSelectedColor(color) {
    selectedColor = color;
    currentPath = makeNewPath();
}

function makeNewPath() {
    return {points : [], color : colors[selectedColor], lineWidth: _lineWidth};
}

var guessDisplay = GuessDisplay("guessDisplay");

var currentPath = makeNewPath();

var pencilTool = new PencilTool();

// Local event handlers
// =============================================================================

var timeLeft = document.getElementById("secondsLeft");
var guessInput = document.getElementById("guessInput");
var undoButton = document.getElementById("undoButton");
var increaseButton = document.getElementById("increaseButton");
var decreaseButton = document.getElementById("decreaseButton");

undoButton.addEventListener('mouseup', function(e) {
    socket.emit('undoLastLine');
});

increaseButton.addEventListener('mouseup', function(e) {
    socket.emit('increaseLineWidth');
});

decreaseButton.addEventListener('mouseup', function(e) {
    socket.emit('decreaseLineWidth');
});

    
canvas.addEventListener('mousedown', function (e) {
    pencilTool.mouseDown(relativeMousePosition(e));
});

canvas.addEventListener('mousemove', function (e) {
    pencilTool.didMoveTo(relativeMousePosition(e));
});

canvas.addEventListener('mouseup', function (e) {
    pencilTool.mouseUp(relativeMousePosition(e));
});

canvas.addEventListener('mouseover', function (e){
    document.body.style.cursor = "url(style/cursors/"+_lineWidth+"pix.cur), auto";
});

canvas.addEventListener('mouseleave', function (e) {
    document.body.style.cursor = "default";
});

guessInput.addEventListener('keydown', function(e) {
    if(e.keyCode == '13') {
        socket.emit(events.guess, guessInput.value);
        guessInput.value = '';
    }
});

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

socket.on(events.timeUpdate, function(newTime){
    timeLeft.innerHTML = newTime;
});

socket.on(events.startRound, function(data) {
    
});

socket.on(events.newWord, function (data) {
    console.log("new word: ", data);
    document.getElementById('current-word').innerText = data;
    if(data.drawer === true) {
        document.getElementById('flip-main').classList.add("isDrawing");
    }
    else {
        document.getElementById('flip-main').classList.remove("isDrawing");
    }
});

socket.on(events.colorChange, function(data){
    setSelectedColor(data);
});

socket.on("guess", function(guess) {
    console.log("Received guess: ", guess);
    guessDisplay.show(guess);
});

socket.on(events.undoLastLine, function() {
    undoLastLine();
})

socket.on(events.increaseLineWidth, function() {
    increaseLineWidth();
});

socket.on(events.decreaseLineWidth, function() {
    decreaseLineWidth();
});

// TODO: Put in a seperate general Path class
function renderPath(path) {
    if(path.points.length <= 1) return; // No use in drawing a path that has no segments ;'~P
    ctx.beginPath();
    ctx.lineWidth = path.lineWidth;
    ctx.moveTo(path.points[0].x, path.points[0].y);
    ctx.strokeStyle = path.color;
    for(var i = 1; i < path.points.length; i++) {
        ctx.lineTo(path.points[i].x, path.points[i].y);
    }
    ctx.stroke();
    ctx.closePath();
}

function drawPreview(){
    preview.clearRect(0,0,previewCanvas.width,previewCanvas.height);
    preview.beginPath();
    preview.moveTo(25,45);
    preview.lineTo(25,5);

    preview.lineWidth = _lineWidth;
    preview.strokeStyle = colors[selectedColor];

    preview.stroke();
    preview.closePath();
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
    drawPreview();
    window.requestAnimationFrame(render);
};

function relativeMousePosition(e) {
    var source = canvas.getBoundingClientRect();
    return {
        x: e.clientX - source.left,
        y: e.clientY - source.top
    };
}

// Canvas rendering kickoff

render();
window.requestAnimationFrame(render);