module.exports.newRound = function(word, timerCallback, roundEndedCallback, time) {
    var word = word || "typpi";
    var timeLeft = time || 30;
    var timerCallback = timerCallback;
    var roundEndedCallback = roundEndedCallback;
    
    var _timerInterval;
    var _hasStarted = false;
    var _hasTimedOut = false;
    
    var _isCorrect = function(guessedWord) {
        if(guessedWord == word) {
            return true;
        }
        return false;
    }
    
    var guess = function(guessedWord) {
        if(_isCorrect(guessedWord)) {
            console.log("Currect guess!");
            clearInterval(_timerInterval);
            roundEndedCallback({reason:"correct_guess", correct: word});
        }
        console.log("Incurrect guess!");
    };
    
    var _tick = function() {
        timeLeft--;
        timerCallback(timeLeft);
        if(timeLeft <= 0) {
            clearInterval(_timerInterval);
            roundEndedCallback({reason: "timeout", correct: word});
        }
    };
    
    var start = function() {
        _hasStarted = true;
        _timerInterval = setInterval(_tick, 1000);
        timerCallback(timeLeft);
    };
    
    return {guess: guess,
            word: word,
            start: start
    }
};