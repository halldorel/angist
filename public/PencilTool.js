function PencilTool() {
    var _oldPos = {x: 0, y: 0};
    var _newPos = {x: 0, y: 0};
    var _currentPos = {x: 0, y: 0};
    var _isDown = false;
    var _drawingEnabled = true;

    var _kSignificant = 6 ^ 2;

    var mouseDown = function (pos) {
        if (!_drawingEnabled) return;
        _isDown = true;
        _newPos = pos;
        _currentPos = pos;
        _sendInitialToServer();
    };

    var mouseUp = function (pos) {
        if (!_drawingEnabled || _isDown === false) return;
        _currentPos = pos;
        _isDown = false;
        _sendFinalToServer();
    };

    var isDown = function () {
        return _isDown;
    };

    var _hasMovedSignificantly = function () {
        return (Math.abs(_oldPos.x - _newPos.x) +
            Math.abs(_oldPos.y - _newPos.y)) > _kSignificant;
    };

    var didMoveTo = function (pos) {
        if (!_drawingEnabled) return;
        _newPos = pos;
        if (_hasMovedSignificantly()) {
            _conformToNewMouseCoordinates();
            if (_isDown) {
                _sendIntermediateToServer();
            }
        }
    };

    var _conformToNewMouseCoordinates = function () {
        _oldPos = _currentPos;
        _currentPos = _newPos;
    }

    var _sendInitialToServer = function () {
        socket.emit(events.beginPath, _currentPos);
    };

    var _sendIntermediateToServer = function () {
        socket.emit(events.newPoint, _currentPos);
    }

    var _sendFinalToServer = function () {
        socket.emit(events.closePath, _currentPos);
    };
    
    var enable = function () {
        _drawingEnabled = true;
    };
    
    var disable = function () {
        _drawingEnabled = false;
    };
    return {
        mouseDown: mouseDown,
        mouseUp: mouseUp,
        isDown: isDown,
        didMoveTo: didMoveTo,
        enable: enable,
        disable: disable
    };
}