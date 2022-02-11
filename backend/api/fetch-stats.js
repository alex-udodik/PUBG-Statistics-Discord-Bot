const api = require('../utility/pubg/api');
const cacheKey = require('../utility/cache/key-builder')
const cache = require('../utility/cache/redis-cache');
const QueryBuilderOr = require('../utility/database/query-builder-or');
const mongodb = require('../utility/database/mongodb-helper');

module.exports = {

    fetchStats: async function (obj, shard, season, gameMode, ranked) {

        obj = objInit(obj, shard, season, gameMode, ranked);
        obj = createKeys(obj);
        obj = await checkInCache(obj);

        if (obj.statsToCheckInMongo.length === 0) { console.log("Found everything in cache, returning..."); return obj;}

        obj = await checkInMongo(obj);
        if (obj.statsToFetchFromApi.length === 0) {console.log("Found everything from cache and mongodb, returning..."); return obj;}

        obj = await getStatsFromApi(obj);
        return obj;
    }
}

objInit = (obj, shard, season, gameMode, ranked) => {
    obj.query = {shard: shard, season: season, gameMode: gameMode, ranked: ranked}
    obj.statsKeys = [];
    obj.statsToCheckInMongo = [];
    obj.statsToCheckInMongo = []
    obj.statsToCache = [];
    obj.statsToMongo = [];
    obj.validAccounts.forEach(account => account.rawStats = null)

    return obj;
}
createKeys = (obj) => {
    const shard = obj.query.shard
    const season = obj.query.season
    const gameMode = obj.query.gameMode
    const ranked = obj.query.ranked

    obj.validAccounts.forEach(account => {
        const accountId = account.accountId;
        var key;

        if (ranked) {
            key = cacheKey.buildKey([shard, season, accountId])
        } else {
            key = cacheKey.buildKey([shard, season, gameMode, accountId])
        }
        obj.statsKeys.push(key);
    })

    return obj;
}

checkInCache = async (obj) => {
    if (obj.query.ranked) {
        const key = obj.statsKeys[0];
        const result = await cache.verifyKey(key)
        if (result !== null) {
            console.log("Found stats in cache for: ", key);
            const parsedResult = await JSON.parse(result)
            obj.validAccounts[0].rawStats = parsedResult.stats;
        } else {
            obj.statsToCheckInMongo.push(key);
        }

    } else {
        await Promise.all(obj.statsKeys.map(async key => {
            const result = await cache.verifyKey(key);
            if (result !== null) {
                console.log("Found stats in cache for: ", key);
                const parsedResult = await JSON.parse(result)
                const accountId = parsedResult.accountId;

                obj.validAccounts.forEach(account => {
                    if (account.accountId === accountId) {
                        account.rawStats = parsedResult.stats
                        obj.statsToCache.push({key: key, value: JSON.stringify(parsedResult)});
                    }
                })

            } else {
                obj.statsToCheckInMongo.push(key);
            }
        }))
    }

    return obj;
}

checkInMongo = async (obj) => {

    var queryBuilderOr = new QueryBuilderOr();
    obj.statsToCheckInMongo.forEach(key => {
        queryBuilderOr.addQuery("key", key);
    })

    const query = queryBuilderOr.build();
    const mongoResults = await mongodb.findMany("PUBG", "PlayerStats", query);

    console.log("Mongo query: ", query);
    await mongoResults.forEach(document => {
        obj.validAccounts.forEach(account => {
            if (account.rawStats === null && account.accountId === document.accountId) {
                account.rawStats = document.stats
                const key = document.key;
                obj.statsToCache.push({key: key, value: JSON.stringify(document)});
            }
        })
    })

    obj.statsToFetchFromApi = [];

    obj.validAccounts.forEach(account => {
        if (account.rawStats === null) {
            const accountId = account.accountId;
            obj.statsToFetchFromApi.push(accountId);
        }
    })

    return obj;
}

getStatsFromApi = async (obj) => {

    const shard = obj.query.shard;
    const season = obj.query.season;
    const gameMode = obj.query.gameMode;

    var url = "";

    if (obj.query.ranked) {
        const accountId = obj.statsToFetchFromApi[0]
        url = `https://api.pubg.com/shards/${shard}/players/${accountId}/seasons/${season}/ranked`;
    } else {
        var urlPreJoin = [`https://api.pubg.com/shards/${shard}/seasons/${season}/gameMode/${gameMode}/players?filter[playerIds]=`];

        obj.statsToFetchFromApi.forEach(accountId => {
            urlPreJoin.push(`${accountId},`);
        })
        url = urlPreJoin.join("");
        url = url.slice(0, -1);
    }

    const results = await api.fetchData(url, 5000);
    console.log(url);

    if ('errors' in results) {
        return {APIError: true, details: "Fetching stats"}
    }
    if (results instanceof Error) {
        return {APIError: true, details: "PUBG API"}
    } else {
        var documents = [];

        obj.validAccounts.forEach(account => {
            //TODO: fix for ranked. Ranked uses an object instead of an array?
            results.data.forEach(stats_ => {

                if (obj.query.ranked) {

                }
                else {
                    var accountIdFromAPI = stats_.relationships.player.data.id;
                    var accountIdInput = account.accountId;

                    if (accountIdFromAPI === accountIdInput) {
                        account.rawStats = stats_.attributes.gameModeStats[gameMode];

                        const key = cacheKey.buildKey([shard, season, gameMode, accountIdFromAPI])
                        const document = {
                            key: key,
                            accountId: accountIdFromAPI,
                            stats: stats_.attributes.gameModeStats[gameMode]
                        }

                        documents.push(document)
                        obj.statsToCache.push({key: key, value: JSON.stringify(document)});
                    }
                }
            })
        })

        await insertStatsIntoMongo(documents, season);
        await Promise.all(obj.statsToCache.map(async item => {
            await cache.insertKey(item.key, item.value, 1800);
        }))
    }

    console.log("OBJ: ", obj);
    return obj;
}

insertStatsIntoCache = async (key, value, ttl) => {
    await cache.insertKey(key, value, ttl)
}
insertStatsIntoMongo = async (documents, season) => {
    if (season !== "lifetime"){
        await mongodb.insertMany("PUBG", "PlayerStats", documents);
    }
}