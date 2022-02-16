const CacheSingleton = require('./redis-cache-singleton');
const RedisCacheError = require("../../errors/RedisCacheError");

module.exports = {

    verifyKey: async function(key) {
        var cache = CacheSingleton.getInstance();
        if (cache === null) {throw new RedisCacheError("Unable to connect to the redis cache instance");}

        return await cache.get(key, (error, data) => {
            if (error) {
                throw new RedisCacheError(`Unable to verify key ==>  ${key}  <== from cache`);
            }
            else {
                return data;
            }
        });
    },

    insertKey: async function(key, value, expire) {
        var cache = CacheSingleton.getInstance();
        if (cache === null) {throw new RedisCacheError("Unable to connect to the redis cache instance");}

        return await cache.set(key, value, {
            EX: expire,   
        });
    },
}