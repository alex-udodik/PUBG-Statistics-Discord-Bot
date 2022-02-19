const WebSocket = require("ws");

var BackendListenerSingleton = (function () {

    var instance;

    function createInstance() {
        const echoSocketUrl = "ws://localhost:3000/notifications"
        const socket = new WebSocket(echoSocketUrl);
        console.log('Waiting for new notifications from server');

        return socket;
    }

    return {
        getInstance: function() {
            if (!instance) {
                instance = createInstance();
            }
            return instance;
        }
    };
})();

module.exports = BackendListenerSingleton;