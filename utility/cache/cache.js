const CacheSingleton = require('./cache-singleton');

module.exports = {


    verifyKey: async function(key) {
        var cache = CacheSingleton.getInstance();
        return await cache.get(key, (error, data) => {
            if (error) {
                return error;
            }
            else {
                return data;
            }
        });
    },

    verifyKeys: async function(keys) {
        var namesInCache = [];

        for (var i = 0; i < keys.length; i++) {
            const value = await this.verifyKey(keys[i])
            var obj;
            if (value !== null) { obj = {name: keys[i], accountId: value}}
            else { obj = {name: keys[i], accountId: null}}
            namesInCache.push(obj);
        }

        return namesInCache;
    },

    insertKey: async function(key, value, expire) {
        var cache = CacheSingleton.getInstance();
        return await cache.set(key, value, {
            EX: expire,   
        });
    },

    TTL: 1800,
}