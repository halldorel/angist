var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

var rotate = 0;



var render = function() {
	rotate += Math.PI/64;
	ctx.save();
	ctx.translate(canvas.width/2, canvas.height/2);
	ctx.rotate(rotate);
	ctx.translate(-canvas.width/2, -canvas.height/2);
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.beginPath();
	ctx.fillStyle = "pink";
	ctx.fillRect(170, canvas.height/2 - 25, 230, 50);
	ctx.arc(190, canvas.height/2 - 40, 30, 0, 2*Math.PI);
	ctx.arc(190, canvas.height/2 + 40, 30, 0, 2*Math.PI);
	ctx.closePath();

	ctx.arc(400, canvas.height/2, 25, 0, 2*Math.PI);
	ctx.fill();
	ctx.restore();
	
	window.requestAnimationFrame(render);
};

window.requestAnimationFrame(render);