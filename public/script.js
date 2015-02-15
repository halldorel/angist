var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

var _lineWidth = 3;
var selectedColor = 'teal';


// Use this dictionary for server event names 
var events = {
    newPoint  : 'newPoint',
    beginPath : 'beginPath',
    closePath : 'closePath',
    colorChange : 'colorChange'
};

var socket = io.connect('', {secure: true});

var paths = [];

var i = 0;

function setSelectedColor(color)
{
    selectedColor = color;
    currentPath = makeNewPath();
}

function makeNewPath(){
    return {points : [], color : colors[selectedColor]}
}

var currentPath = makeNewPath();

socket.on("beginPath", function(data) {
    currentPath.points.push(data);
});

socket.on("newPoint", function(data) {
    currentPath.points.push(data);
});

socket.on("closePath", function(data) {
    currentPath.points.push(data);
    paths.push(currentPath);
    currentPath = makeNewPath();
});

socket.on("colorChange", function(data){
    setSelectedColor(data);
})


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

var render = function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for(var i = 0; i < paths.length; i++) {
        renderPath(paths[i]);
    }
    
    renderPath(currentPath);
    
    window.requestAnimationFrame(render);
};

function relativeMousePosition(e)
{
    var source = canvas.getBoundingClientRect();
    return {
        x: e.clientX - source.left,
        y: e.clientY - source.top
    };
}

var pencilTool = new PencilTool();

document.addEventListener('mousedown', function(e) {
    pencilTool.mouseDown(relativeMousePosition(e));
});

document.addEventListener('mousemove', function(e) {
    pencilTool.didMoveTo(relativeMousePosition(e));
});

document.addEventListener('mouseup', function(e) {
    pencilTool.mouseUp(relativeMousePosition(e));
});

render();

window.requestAnimationFrame(render);