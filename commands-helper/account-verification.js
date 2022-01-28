const cache = require('../utility/cache/redis-cache');
const MongoQueryBuilder = require('../utility/database/query-builder');
const mongodb = require('../utility/database/mongodb-helper');
const api = require('../utility/pubg/api');

class AccountVerificationHandler {
    constructor(names) {
        this.names = names;
    }

    async getAccounts() {
        var obj = await _checkNamesInCache(this.names);
        obj = await _checkNamesInDatabase(obj);
        obj = await _checkNamesFromAPI(obj);

        if (obj === "Error") {
            return "Error";
        }
        await _insertNamesIntoCache(obj, cache.TTL);
        await _insertAccountsIntoDatabase(obj)
        return obj;
    }
}

_checkNamesInCache = async (names) => {
    var obj = {
        accounts: [],
        namesFromCacheCount: 0,
        namesFromMongoDBCount: 0,
        accountsToCache: [],
        accountsToMongodb: [],
        accountsFailedAPILookUp: [],
        failedAPILookUp: false,
        verifiedAccounts: false,
    };

    var namesFromCacheCount = 0;

    var accounts = [];
    await Promise.all(names.map(async name_ => {
        const name = name_.toLowerCase();
        const id = await cache.verifyKey(name);
        if (id !== null) {
            var account = { name: name, accountId: id };
            accounts.push(account);
            obj.accountsToCache.push(account);
            namesFromCacheCount++;
            obj.verifiedAccounts = true;
        }
        else { accounts.push({ name: name_, accountId: null }); }
    }));

    obj.accounts = accounts
    obj.namesFromCacheCount = namesFromCacheCount;

    return obj;
}

_checkNamesInDatabase = async (obj) => {

    if (obj.accounts.length === obj.namesFromCacheCount) {return obj;}

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
    var namesFromMongoDBCount = 0;

    await dbResults.forEach(doc => {
        namesFromMongoDBCount++;
        obj.accounts.forEach(account => {
            if (doc.name === account.name.toLowerCase()) {
                account.accountId = doc.accountId;
                obj.accountsToCache.push({ name: account.name.toLowerCase(), accountId: doc.accountId });
                obj.verifiedAccounts = true;
            }
        })
    }
    );

    obj.namesFromMongoDBCount = namesFromMongoDBCount;
    return obj;
}

_checkNamesFromAPI = async (obj) => {

    var urlPreJoin = ['https://api.pubg.com/shards/steam/players?filter[playerNames]='];

    var accountsToLookUp = [];
    obj.accounts.forEach(account => {
        if (account.accountId === null) {
            urlPreJoin.push(`${account.name},`);
            accountsToLookUp.push(account.name);
        }
    })

    if (urlPreJoin.length === 1) { return obj; }

    var url = urlPreJoin.join("");
    url = url.slice(0, -1);

    console.log("url ", url);
    const results = await api.fetchData(url, 5000);
    console.log("pubg results: ", results);

    if (results instanceof Error) {  return "Error"; }
    if ('errors' in results) {
        obj.failedAPILookUp = true; 
        obj.accountsFailedAPILookUp = accountsToLookUp;
        return obj;
    }

    else {
        var accountsToMongodb = [];

        results.data.forEach(accountDataFromAPI => {
            obj.accounts.forEach(account => {
                if (accountDataFromAPI.attributes.name.toLowerCase() === account.name.toLowerCase()) {
                    account.accountId = accountDataFromAPI.id
                }
            })
            var displayName = accountDataFromAPI.attributes.name;
            accountsToMongodb.push({ name: displayName.toLowerCase(), displayName: displayName, accountId: accountDataFromAPI.id });
            obj.accountsToCache.push({ name: displayName.toLowerCase(), accountId: accountDataFromAPI.id });
        });

        obj.accountsToMongodb = accountsToMongodb;

        console.log("obj: ", obj);
        return obj
    }
}

_insertNamesIntoCache = async (obj, ttl) => {

    if (obj.accountsToCache.length > 0) {
        await Promise.all(obj.accountsToCache.map(async account => {
            const name = account.name.toLowerCase();
            const accountId = account.accountId;
            console.log("name to insert into cache: ", name, accountId);
            await cache.insertKey(name, accountId, ttl)
            await cache.insertKey(accountId, name, 60)
        }))
    }
}

_insertAccountsIntoDatabase = async (obj) => {
    if (obj.accountsToMongodb.length > 0) {
        const results = await mongodb.insertMany("PUBG", "Names", obj.accountsToMongodb);
        console.log("Insertion into mongodb: ", results);
    }
}

module.exports = AccountVerificationHandler;