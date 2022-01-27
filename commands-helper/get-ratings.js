const cache = require('../utility/cache/redis-cache');
const MongoQueryBuilder = require('../utility/database/query-builder');
const mongodb = require('../utility/database/mongodb-helper');

class Ratings {
    constructor(names) {
        this.names = names;
    }

    async getRatings() {
        var obj = await _checkNamesInCache(this.names);
        obj = await _checkNamesInDatabase(obj);
    }
}

_checkNamesInCache = async (names) => {
    var obj = {
        accounts: [],
        namesFromCache: 0
    };

    var namesFromCache = 0;

    var accounts = [];
    await Promise.all(names.map(async name => {
        const id = await cache.verifyKey(name);
        if (id !== null) { accounts.push({ name: name, accountId: id }); namesFromCache++; }
        else { accounts.push({ name: name, accountId: null }); }
    }));

    obj.accounts = accounts
    obj.namesFromCache = namesFromCache;

    return obj;
}

_checkNamesInDatabase = async (obj) => {

    if (obj.accounts.length === obj.namesFromCache) {
        return obj;
    }

    var querybuilder = new MongoQueryBuilder();

    obj.accounts.forEach(item => {
        if (item.accountId === null) {
            const key = Object.keys(item)[0];
            const value = item.name;
            querybuilder.addQuery(key, value);
        }
    });

    const query = querybuilder.build();
    console.log(query);
    const dbResults = await mongodb.findMany("PUBG", "Names", query);
    var namesFromMongoDB = 0;

    await dbResults.forEach(doc => {
        namesFromMongoDB++;
        obj.accounts.forEach(account => {
            if (doc.name === account.name.toLowerCase()) {
                account.accountId = doc.accountId;
            }
        })
    }
    );

    obj.namesFromMongoDB = namesFromMongoDB;
    return obj;
}

_checkNamesFromAPI = async (obj) => {
    if (obj.namesFromMongoDB === 0) { return obj; }

    
}

module.exports = Ratings;