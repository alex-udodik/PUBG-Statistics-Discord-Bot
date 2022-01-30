const CacheSingleton = require('./redis-cache-singleton');

module.exports = {

    verifyKey: async function(key) {
        var cache = CacheSingleton.getInstance();
        return await cache.get(key, (error, data) => {
            if (error) {
                console.log("cache lookup failed123");
                return error;
            }
            else {
                return data;
            }
        });
    },

    insertKey: async function(key, value, expire) {
        var cache = CacheSingleton.getInstance();
        return await cache.set(key, value, {
            EX: expire,   
        });
    },

    //30 mins
    TTL: 1800,
}