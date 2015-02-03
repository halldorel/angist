function PencilTool () {
    var _oldPos = { x : 0, y : 0 };
    var _newPos = { x : 0, y : 0 };
    var _currentPos = { x: 0, y : 0 };
    var _isDown = false;
    
    var _kSignificant = 6^2; 
    
    var mouseDown = function(pos) {
        _isDown = true;
        _newPos = pos;
        _currentPos = pos;
        _sendInitialToServer();
    };
    
    var mouseUp = function(pos) {
        _currentPos = pos;
        _isDown = false;
        _sendFinalToServer();
    };
    
    var isDown = function() {
        return _isDown;
    };
    
    var _hasMovedSignificantly = function() {
        return (Math.abs(_oldPos.x - _newPos.x) +
        Math.abs(_oldPos.y - _newPos.y)) > _kSignificant;
    };
    
    var didMoveTo = function (pos) {
        _newPos = pos;
        if(_hasMovedSignificantly()) {
            _conformToNewMouseCoordinates();
            if(_isDown) {
                _sendIntermediateToServer();
            }
        }
    };
    
    var _conformToNewMouseCoordinates = function() {
        _oldPos = _currentPos;
        _currentPos = _newPos;
    }
    
    var _sendInitialToServer = function() {
        socket.emit(events.beginPath, _currentPos);
    };
    
    var _sendIntermediateToServer = function() {
        socket.emit(events.newPoint, _currentPos);
    }
    
    var _sendFinalToServer = function() {
        socket.emit(events.closePath, _currentPos);
    };

    return {mouseDown : mouseDown,
            mouseUp : mouseUp,
            isDown : isDown,
            didMoveTo : didMoveTo
    };
}