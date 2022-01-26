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

    //takes in a list of objects which just have {key: value}
    //example: [{key: "key", value: "value"}, {key: "key", value: "value"} ]
    insertKeys: async function(key_value_pairs, expire) {
        for (var i = 0; i < key_value_pairs.length; i++) {
            const key = key_value_pairs[i].key;
            const value = key_value_pairs[i].value;
            await this.insertKey(key, value, expire)
        }
    },

    //30 mins
    TTL: 1800,
}