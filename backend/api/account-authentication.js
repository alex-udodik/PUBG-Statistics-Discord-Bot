const cache = require('../utility/cache/redis-cache');
const QueryBuilderAnd = require('../utility/database/query-builder-and');
const QueryBuilderOr = require('../utility/database/query-builder-or');
const mongodb = require('../utility/database/mongodb-helper');
const api = require('../utility/pubg/api');
const cacheKey = require('../utility/cache/key-builder')

class AccountVerificationHandler {
    constructor(names, shard) {
        this.names = names;
        this.shard = shard;
        
        this.obj = {
            validAccounts: [],
            invalidAccounts: [],
            accountsToCheckInMongoDB: [],
            accountsToCheckFromAPI: [],
            accountsToCache: [],
            accountsToMongoDB: [],
            namesFromCacheCount: 0,
            namesFromMongoDBCount: 0,
            failedAPILookUp: false,
            verifiedAccounts: false,
            error: {
                api: false,
                mongodb: {
                    read: false,
                    insert: false
                }
            }
        };
    }

    verifyAccounts = async () => {
        var obj = await _checkNamesInCache(this.names, this.obj, this.shard);
        obj = await _checkNamesInMongoDB(obj, this.shard);
        obj = await _checkNamesFromPubgApi(obj, this.shard, this.names);
        await _insertNamesIntoCache(obj, 1800, this.shard);
        await _insertAccountsIntoDatabase(obj, this.shard);
        return obj;
    }
}

_checkNamesInCache = async (names, obj, shard) => {
    await Promise.all(names.map(async name_ => {
        const name = name_.toLowerCase();
        const key = cacheKey.buildKey([shard, name]);
        const value = await cache.verifyKey(key);
        if (value !== null) {
            console.log("FOUND IN CACHE: ", value);
            const result = await JSON.parse(value)
            const account = {name: name, displayName: result.displayName, accountId: result.accountId, shard: shard};
            obj.validAccounts.push(account);
            obj.accountsToCache.push(account);
            obj.namesFromCacheCount++;
            obj.verifiedAccounts = true;
        } else {
            obj.accountsToCheckInMongoDB.push({name: name_});
        }
    }))

    return obj;
}

_checkNamesInMongoDB = async (obj, shard) => {
    if (obj.accountsToCheckInMongoDB.length > 0) {
        const queryNames = new QueryBuilderOr();
        obj.accountsToCheckInMongoDB.forEach(name_ => {
            const key = Object.keys(name_)[0];
            const value = name_.name.toLowerCase();
            queryNames.addQuery(key, value);
        })

        const queryShard = new QueryBuilderOr();
        queryShard.addQuery("shard", shard);

        const queryBuilderAnd = new QueryBuilderAnd();
        queryBuilderAnd.addOr(queryNames.build());
        queryBuilderAnd.addOr(queryShard.build());
        const query = queryBuilderAnd.build();

        const dbResults = await mongodb.findMany("PUBG", "Names", query);
        const dbResultsNames = [];
        await dbResults.forEach(doc => {
                dbResultsNames.push(doc.name.toLowerCase());
                obj.namesFromMongoDBCount++;
                obj.accountsToCheckInMongoDB.forEach(account_ => {
                    if (doc.name === account_.name.toLowerCase()) {
                        const account = {
                            name: account_.name.toLowerCase(),
                            displayName: doc.displayName,
                            accountId: doc.accountId,
                            shard: shard
                        };
                        obj.validAccounts.push(account);
                        obj.accountsToCache.push(account);
                        obj.verifiedAccounts = true;
                    }
                })
            }
        );

        //get the difference of the 2 lists.
        obj.accountsToCheckFromAPI = obj.accountsToCheckInMongoDB.filter(x =>
            !dbResultsNames.includes(x.name.toLowerCase())
        )
    }

    return obj;
}

_checkNamesFromPubgApi = async (obj, shard, names) => {
    if (obj.accountsToCheckFromAPI.length > 0) {
        var urlPreJoin = [`https://api.pubg.com/shards/${shard}/players?filter[playerNames]=`];
        obj.accountsToCheckFromAPI.forEach(account => {
            const name = account.name;
            urlPreJoin.push(`${name},`);
        });

        var url = urlPreJoin.join("");
        url = url.slice(0, -1);
        const results = await api.fetchData(url, 5000);
        if ('errors' in results) {
            obj.failedAPILookUp = true;
            obj.invalidAccounts = obj.accountsToCheckFromAPI;
            return obj;
        }

        results.data.forEach(accountDataFromAPI => {
            obj.accountsToCheckFromAPI.forEach(account => {
                if (accountDataFromAPI.attributes.name.toLowerCase() === account.name.toLowerCase()) {
                    const account = {
                        name: accountDataFromAPI.attributes.name.toLowerCase(),
                        displayName: accountDataFromAPI.attributes.name,
                        accountId: accountDataFromAPI.id,
                        shard: shard
                    };
                    obj.validAccounts.push(account);
                    obj.accountsToMongoDB.push(account);
                    obj.accountsToCache.push(account);
                }
            })
        });

        var invalidAccounts = names.filter(x =>
            !obj.validAccounts.find(z => x.toLowerCase() === z.name.toLowerCase())
        )
        invalidAccounts.forEach(x => {
            obj.invalidAccounts.push({name: x})
        })
    }

    return obj;
}

_insertNamesIntoCache = async (obj, ttl, shard) => {
    if (obj.accountsToCache.length > 0) {
        await Promise.all(obj.accountsToCache.map(async account => {
            const name = account.name.toLowerCase();
            const displayName = account.displayName;
            const accountId = account.accountId;
            const cacheObject = {name: name, displayName: displayName, accountId: accountId, shard: shard};
            const key = cacheKey.buildKey([shard, name]);
            console.log("Name to insert into cache: ", key, accountId);
            await cache.insertKey(key, JSON.stringify(cacheObject), ttl);
        }))
    }
}

_insertAccountsIntoDatabase = async (obj, shard) => {
    if (obj.accountsToMongoDB.length > 0) {
        const results = await mongodb.insertMany("PUBG", "Names", obj.accountsToMongoDB);
        console.log("Insert account into MongoDB 'PUBG' | 'Names' info status: ", results.acknowledged,);
        console.log("Inserted count: ", results.insertedCount,);
    }
}

module.exports = AccountVerificationHandler;