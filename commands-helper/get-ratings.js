const cache = require('../utility/cache/redis-cache');
const MongoQueryBuilder = require('../utility/database/query-builder');
const mongodb = require('../utility/database/mongodb-helper');

class Ratings {
    constructor(names) {
        this.names = names;
    }

    async getRatings() {
        const obj = await _checkNamesInCache(this.names);
        await _checkNamesInDatabase(obj);
    }


}
_checkNamesInCache = async (names) => {
    var cachedNames = [];

    await Promise.all(names.map(async name => {
        const id = await cache.verifyKey(name);
        if (id !== null) { cachedNames.push({ name: name, accountId: id });}
        else { cachedNames.push({ name: name, accountId: null });}
    }));
    return cachedNames
}

_checkNamesInDatabase = async (accounts) => {

    var querybuilder = new MongoQueryBuilder();

    accounts.forEach(item => {
        if (item.accountId === null) {
            const key = Object.keys(item)[0];
            const value = item.name;
            querybuilder.addQuery(key, value);
        }
    })


    const query = querybuilder.build();
    console.log(query);
    const dbResults = await mongodb.findMany("PUBG", "Names", query);
    await dbResults.forEach(doc => console.log(doc));

}


module.exports = Ratings;