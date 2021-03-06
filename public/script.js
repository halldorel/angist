var canvas = document.getElementById("canvas");

var ctx = canvas.getContext("2d");


var _lineWidth = 3;
var selectedColor = 'teal';

// Temporary hack to memorize whether user is drawing or not
// in this round.
var userIsDrawer = false;

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
    startRound: 'startRound',
    roundEnded : 'roundEnded',
    drawerStatus: 'drawerStatus',
    userAnsweredCorrectly: 'userAnsweredCorrectly',
    timeout: 'timeout'
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
pencilTool.disable();

// Local event handlers
// =============================================================================

var timeLeft = document.getElementById("secondsLeft");
var guessInput = document.getElementById("guessInput");
var undoButton = document.getElementById("undoButton");
var increaseButton = document.getElementById("increaseButton");
var decreaseButton = document.getElementById("decreaseButton");

var clock = document.getElementById("secondsLeft");
var usernameElement = document.getElementById("username");
var loginButtonElement = document.getElementById("login-button");
var userMessageElement = document.getElementById("user-message");

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
    pencilTool.mouseUp(relativeMousePosition(e));
});

guessInput.addEventListener('keydown', function(e) {
    if(e.keyCode == '13') {
        // FIXME
        if(userIsDrawer === false)
        {
            socket.emit(events.guess, guessInput.value);
            guessInput.value = '';
        }
        else
        {
            flashColor(guessInput, "wrong");
        }
    }
});


loginButtonElement.addEventListener('mousedown', function(e) {
    var username = usernameElement.value;
    socket.emit('setUsername', username);
    console.log(username);
    usernameElement.innerHTML = "Skráður inn sem: " + username;
});

usernameElement.addEventListener('keydown', function(e) {
    if(e.keyCode == '13') {
        var username = e.target.value;
        socket.emit('setUsername', username);
        usernameElement.innerHTML = "Skráður inn sem: " + username;
    }
});

// Network event handlers
// =============================================================================
socket.on(events.beginPath, function (data) {
    currentPath.points.push(data);
    render();
});

socket.on(events.newPoint, function (data) {
    currentPath.points.push(data);
    render();
});

socket.on(events.closePath, function (data) {
    currentPath.points.push(data);
    paths.push(currentPath);
    currentPath = makeNewPath();
    render();
});

socket.on(events.timeUpdate, function(newTime){
    timeLeft.innerHTML = newTime;
});

socket.on(events.startRound, function(data) {
    clock.classList.remove("timeout");
    paths = [];
    currentPath = makeNewPath();
});

socket.on(events.roundEnded, function(data) {
    clock.classList.add("timeout");
    pencilTool.disable();
});

socket.on(events.drawerStatus, function(data) {
    showUserMessage("Giskaðu á hvað <strong>" + data.username + "</strong> er að teikna");
});

socket.on(events.userAnsweredCorrectly, function (data) {
    showUserMessage("Þú svaraðir rétt! Búðu þig undir að teikna …");
});

socket.on(events.newWord, function (data) {
    userIsDrawer = data.drawer;
    if(userIsDrawer === true) {
        document.getElementById('current-word').innerText = data.word;
        pencilTool.enable();
        document.getElementById('flip-main').classList.add("is-drawing");
    }
    else {
        document.getElementById('flip-main').classList.remove("is-drawing");
    }
    render();
});

socket.on(events.colorChange, function(data){
    setSelectedColor(data);
});

socket.on(events.guess, function(guess) {
    console.log("Received guess: ", guess);
    guessDisplay.show(guess);
});

socket.on(events.undoLastLine, function() {
    undoLastLine();
    render();
})

socket.on(events.increaseLineWidth, function() {
    increaseLineWidth();
});

socket.on(events.decreaseLineWidth, function() {
    decreaseLineWidth();
});


socket.on('timeout', function(data) {
    if(data.correct) {
        showUserMessage("Enginn náði að giska á rétt. Orðið var " + data.correct);
    }
});

function showUserMessage(message) {
    userMessageElement.innerHTML = message;
}

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

function flashColor(el, color) {
    el.classList.add(color + " flash");
    setTimeout(function(){
        el.classList.remove(color);
    }, 200);
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
    //window.requestAnimationFrame(render);
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