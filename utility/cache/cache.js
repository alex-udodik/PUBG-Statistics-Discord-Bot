
module.exports = {

    verifyKey: async function(key) {
        return await global.cache.get(key, (error, data) => {
            if (error) {
                return error;
            }
            else {
                return data;
            }
        });
    },

    insertKey: async function(key, value, expire) {
        return await global.cache.set(key, value, {
            EX: expire,   
        });
    },
}