var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

var rotate = 0;

var socket = io.connect('', {secure: true});

var x = 0, y = 0;


socket.on("newPoint", function(data) {
    x = data.x;
    y = data.y;
    console.log(x, y);
    render();
});

var render = function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineTo(x, y);
    ctx.stroke();
  /*rotate += Math.PI/64;
    ctx.save();
    ctx.translate(canvas.width/2, canvas.height/2);
    ctx.rotate(rotate);
    ctx.translate(-canvas.width/2, -canvas.height/2);
    ctx.beginPath();
    ctx.fillStyle = "pink";
    ctx.fillRect(170, canvas.height/2 - 25, 230, 50);
    ctx.arc(190, canvas.height/2 - 40, 30, 0, 2*Math.PI);
    ctx.arc(190, canvas.height/2 + 40, 30, 0, 2*Math.PI);
    ctx.closePath();

    ctx.arc(400, canvas.height/2, 25, 0, 2*Math.PI);
    ctx.fill();
    ctx.restore();
    */
    //window.requestAnimationFrame(render);
};


document.addEventListener('mouseup', function(e) {
    var pos = mousePosition(e);

    socket.emit('newPoint', {
        x: pos.x,
        y: pos.y
    });
    // Returns the mouse position relative to canvas
    function mousePosition(e)
    {
        var source = canvas.getBoundingClientRect();
        return {
            x: e.clientX - source.left,
            y: e.clientY - source.top
        };
    }
});

//window.requestAnimationFrame(render);