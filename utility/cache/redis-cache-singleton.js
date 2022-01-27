const redis = require("redis");

var CacheSingleton = (function () {

    var instance;
    var count = 0;
    function createInstance() {
        const redisPort = 6379
        var object = redis.createClient(redisPort);
        count += 1;
        return object;
        
    }

    return {
        getInstance: function() {
            if (!instance) {
                instance = createInstance();
            }

            console.log("Cache instance count: ", count);
            return instance;
        }
    };
})();

module.exports = CacheSingleton;