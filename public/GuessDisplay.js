function GuessDisplay(element_id) {
    var guessDisplayContainer = document.getElementById(element_id);
    var guessBoxes = guessDisplayContainer.children;
    
    var randomBoxIndices = [];
    
    var guessCounter = 0;
    
    var colorClassNames = ["blue", "teal", "yellow", "purple", "red", "babyblue"];
    
    for(var i = 0; i < guessBoxes.length; i++) {
        randomBoxIndices.push(i);
    }
    
    var reset = function() {
        guessCounter = 0;
        randomBoxIndices = shuffle(randomBoxIndices);
    };
    
    reset();
    
    return {
        show: function(word) {
            var randomBox = guessBoxes[randomBoxIndices[guessCounter++]];
            var randomColor = colorClassNames[Math.floor(Math.random()*colorClassNames.length)];
            randomBox.className = "fade " + randomColor;
            randomBox.innerHTML = word;
            setTimeout(function(){
                randomBox.className = randomColor;
            }, 20);
            if(guessCounter >= randomBoxIndices.length) {
                reset();
            }
        }
    }
}