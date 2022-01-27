const cache = require('../utility/cache/redis-cache');
const MongoQueryBuilder = require('../utility/database/query-builder');
const mongodb = require('../utility/database/mongodb-helper');
const api = require('../utility/pubg/api');
class Ratings {
    constructor(names) {
        this.names = names;
    }

    async getRatings() {
        var obj = await _checkNamesInCache(this.names);
        obj = await _checkNamesInDatabase(obj);
        await _checkNamesFromAPI(obj);
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
            const value = item.name.toLowerCase();
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

    var urlPreJoin = ['https://api.pubg.com/shards/steam/players?filter[playerNames]='];

    obj.accounts.forEach(account => {
        if (account.accountId === null) {
            urlPreJoin.push(`${account.name},`);
        }
    })

    if (urlPreJoin.length === 1) { return obj; }

    var url = urlPreJoin.join("");
    url = url.slice(0, -1);

    console.log("url ", url);
    const results = await api.fetchData(url);
    console.log("pubg results: ", results);

    if ('errors' in results) { return obj; }
    else {
        var accountsToCacheAndStore = [];

        results.data.forEach(accountDataFromAPI => {
            obj.accounts.forEach(account => {
                if (accountDataFromAPI.attributes.name.toLowerCase() === account.name.toLowerCase()) {
                    account.accountId = accountDataFromAPI.id
                }
            })
            var displayName = accountDataFromAPI.attributes.name;
            accountsToCacheAndStore.push({
                name: displayName.toLowerCase(),
                displayName: displayName,
                accountId: accountDataFromAPI.id
            });
        });

        obj.accountsToCacheAndStore = accountsToCacheAndStore;

        console.log("obj: ", obj);
        return obj
    }
}

module.exports = Ratings;