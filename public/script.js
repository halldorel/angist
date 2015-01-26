var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

var rotate = 0;

var socket = io.connect('', {secure: true});

var x = 0, y = 0;

socket.on("message", function(data) {
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

//window.requestAnimationFrame(render);