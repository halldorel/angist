var guessesDisplay = document.getElementById("guessesDisplay");
var ctx2 = guessesDisplay.getContext('2d');
var guess = '';

var guessColors = ["#00ff00","#ff0000","#0000ff"];
var guessXs = [200,300,400,500];
var guessYs = [40,90,130];
var gColor = guessColors[0];
var gX = guessXs[0];
var gY = guessYs[0];

function getRandomValue(arr) {
    var min = 0;
    var max = arr.length-1;
    var rnd = Math.floor(Math.random() * (max - min + 1)) + min;
    return arr[rnd];
}

var alpha = 1,   /// current alpha value
    delta = 0.02; /// delta = speed

var displayGuess = function(text) {
    ctx2.font = "52px sans";
    ctx2.fillStyle = gColor;
    ctx2.fillText(text, gX, gY);

    gColor = getRandomValue(guessColors);
    gX = getRandomValue(guessXs);
    gY = getRandomValue(guessYs);
    guess = guessInput.value;
    guessInput.value = '';
    loop();
}

function loop() {
    alpha -= delta;
    ctx2.clearRect(0, 0, guessesDisplay.width, guessesDisplay.height);
    ctx2.globalAlpha = alpha;
    displayGuess(guess);
    if (alpha <= 0) {
        alpha = 1;
    } else {
        requestAnimationFrame(loop);
    }
}

guessInput.onkeyup = function(e) {
    if (e.keyCode == 13) {
        displayGuess(this.value);
    }
}