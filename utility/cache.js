
module.exports = {

    verifyCache: async function(input) {
        return await global.cache.get(input);
    }
}