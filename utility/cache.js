
module.exports = {

    verifyCache: async function(key) {
        return await global.cache.get(key, (error, data) => {
            if (error) {
                return error;
            }
            else {
                return data;
            }
        });
    },

    insertCache: async function(key, value, expire) {
        return await global.cache.set(key, value, {
            EX: expire,   
        });
    },
}