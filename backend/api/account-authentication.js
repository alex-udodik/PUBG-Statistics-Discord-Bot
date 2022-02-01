const cache = require('../utility/cache/redis-cache');
const MongoQueryBuilder = require('../utility/database/query-builder');
const mongodb = require('../utility/database/mongodb-helper');
const api = require('../utility/pubg/api');

class AccountVerificationHandler {
    constructor(names) {
        this.names = names;
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
        var obj = await _checkNamesInCache(this.names, this.obj);
        obj = await _checkNamesInMongoDB(obj);
        obj = await _checkNamesFromPubgApi(obj);
        console.log(obj)
        await _insertNamesIntoCache(obj, 1800);
        await _insertAccountsIntoDatabase(obj);
        return obj;
    }
}

_checkNamesInCache = async (names, obj) => {
    await Promise.all(names.map(async name_ => {
        const name = name_.toLowerCase();
        const value = await cache.verifyKey(name);
        if (value !== null) {
            console.log("FOUND IN CACHE: ", value);
            const result = await JSON.parse(value)
            const account = {name: name, displayName: result.displayName, accountId: result.accountId};
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

_checkNamesInMongoDB = async (obj) => {
    if (obj.accountsToCheckInMongoDB.length > 0) {
        const queryBuilder = new MongoQueryBuilder();
        obj.accountsToCheckInMongoDB.forEach(name_ => {
            const key = Object.keys(name_)[0];
            const value = name_.name.toLowerCase();
            queryBuilder.addQuery(key, value);
        })

        const query = queryBuilder.build();
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
                            accountId: doc.accountId
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

_checkNamesFromPubgApi = async (obj) => {
    if (obj.accountsToCheckFromAPI.length > 0) {
        var urlPreJoin = ['https://api.pubg.com/shards/steam/players?filter[playerNames]='];
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
                        accountId: accountDataFromAPI.id
                    };
                    obj.validAccounts.push(account);
                    obj.accountsToMongoDB.push(account);
                    obj.accountsToCache.push(account);
                }
            })
            obj.accountsToCheckFromAPI.forEach(name_ => {
                if (name_.name.toLowerCase() !== accountDataFromAPI.attributes.name.toLowerCase()) {
                    const name = {name: name_.name};
                    obj.invalidAccounts.push(name);
                }
            })
        });
    }

    return obj;
}

_insertNamesIntoCache = async (obj, ttl) => {
    if (obj.accountsToCache.length > 0) {
        await Promise.all(obj.accountsToCache.map(async account => {
            const name = account.name.toLowerCase();
            const displayName = account.displayName;
            const accountId = account.accountId;
            const cacheObject = {name: name, displayName: displayName, accountId: accountId};
            console.log("Name to insert into cache: ", name, accountId);
            await cache.insertKey(name, JSON.stringify(cacheObject), ttl);
        }))
    }
}

_insertAccountsIntoDatabase = async (obj) => {
    if (obj.accountsToMongoDB.length > 0) {
        const results = await mongodb.insertMany("PUBG", "Names", obj.accountsToMongoDB);
        console.log("Insert account into MongoDB 'PUBG' | 'Names' info status: ", results.acknowledged,);
        console.log("Inserted count: ", results.insertedCount,);
        console.log("Insert ids: ", results.insertedIds);
    }
}

module.exports = AccountVerificationHandler;