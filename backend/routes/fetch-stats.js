const api = require('../utility/pubg/api');
const cacheKey = require('../utility/cache/key-builder')
const cache = require('../utility/cache/redis-cache');
const QueryBuilderOr = require('../utility/database/query-builder-or');
const mongodb = require('../utility/database/mongodb-helper');
const APIError = require('../errors/APIError');

module.exports = {

    fetchStats: async function (obj, shard, season, gameMode, ranked, ignoreRateLimit) {

        if (obj.validAccounts.length > 0) {
            obj = objInit(obj, shard, season, gameMode, ranked);
            obj = createKeys(obj);

            obj = await checkInCache(obj);

            if (obj.statsToCheckInMongo.length === 0) {
                console.log("Found everything in cache, returning...");
                return obj;
            }

            obj = await checkInMongo(obj);
            if (obj.statsToFetchFromApi.length === 0) {
                console.log("Found everything from cache and mongodb, returning...");
                return obj;
            }

            try {
                obj = await getStatsFromApi(obj, ignoreRateLimit);
            } catch (error) {
                if (error.message === 429) {
                    throw error
                }
                throw new APIError("Failed to fetch stats from PUBG API");
            }
        }
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
            key = cacheKey.buildKey([shard, season, gameMode, accountId, "ranked"])
        } else {
            key = cacheKey.buildKey([shard, season, gameMode, accountId])
        }
        obj.statsKeys.push(key);
    })

    return obj;
}

checkInCache = async (obj) => {
    await Promise.all(obj.statsKeys.map(async key => {
        try {
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
        } catch (error) {
            obj.statsToCheckInMongo.push(key);
            console.log(error.message)
        }
    }))

    return obj;
}

checkInMongo = async (obj) => {

    var queryBuilderOr = new QueryBuilderOr();
    obj.statsToCheckInMongo.forEach(key => {
        queryBuilderOr.addQuery("key", key);
    })

    const query = queryBuilderOr.build();

    try {
        const mongoResults = await mongodb.findMany("PUBG", "PlayerStats", query);

        await mongoResults.forEach(document => {
            obj.validAccounts.forEach(account => {
                if (account.rawStats === null && account.accountId === document.accountId) {
                    account.rawStats = document.stats
                    const key = document.key;
                    obj.statsToCache.push({key: key, value: JSON.stringify(document)});
                }
            })
        })

    } catch (error) {
        console.log(error.message)
    }

    obj.statsToFetchFromApi = [];
    obj.validAccounts.forEach(account => {
        if (account.rawStats === null) {
            const accountId = account.accountId;
            obj.statsToFetchFromApi.push(accountId);
        }
    })

    return obj;
}

getStatsFromApi = async (obj, ignoreRateLimit) => {

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

    var results;

    try {
        var response = await api.fetchData(url, 5000, null, "GET");
        results = await response.json()

        const rateLimit = response.headers.get("x-ratelimit-limit");
        const rateLimitRemaining = response.headers.get("x-ratelimit-remaining");
        const rateLimitReset = response.headers.get("x-ratelimit-reset");

        if (ignoreRateLimit) {
            if (parseInt(rateLimitRemaining) === 0) {
                const currentUnixTime = ((new Date().getTime()) / 1000);
                const secondsToWait = (rateLimitReset - currentUnixTime) + 1
                console.log("Seconds to wait: ", secondsToWait)

                //hit api limits. Must wait.
                await new Promise(resolve => setTimeout(resolve, secondsToWait * 1000));
            }
        }

    } catch (error) {
        throw error;
    }

    console.log(url);

    if ('errors' in results) {
        //TODO: return object and error details
        return {APIError: true, details: "Fetching stats"}
    } else {
        var documents = [];

        await Promise.all(obj.validAccounts.map(async account => {
            var queryBuilder = new QueryBuilderOr();
            queryBuilder.addQuery("id", season);
            const query = queryBuilder.build();
            const seasonDoc = await mongodb.findOne("PUBG", `Seasons-${shard}`, query);

            var document = {
                key: obj.statsKeys[0],
                accountId: account.accountId,
                name: account.name,
                displayName: account.displayName,
                shard: shard,
                season: season,
                gameMode: gameMode,
                ranked: obj.query.ranked,
                stats: null
            }

            if (obj.query.ranked) {

                if (gameMode in results.data.attributes.rankedGameModeStats) {
                    const stats = results.data.attributes.rankedGameModeStats[gameMode];
                    document.stats = stats;
                    account.rawStats = stats
                    obj.statsToCache.push({key: obj.statsKeys[0], value: JSON.stringify(document)});
                }
                if (seasonDoc !== null && !seasonDoc.isCurrentSeason) {
                    documents.push(document)
                }
            } else {
                results.data.forEach(stats_ => {
                    var accountIdFromAPI = stats_.relationships.player.data.id;
                    var accountIdInput = account.accountId;

                    if (accountIdFromAPI === accountIdInput) {
                        account.rawStats = stats_.attributes.gameModeStats[gameMode]
                        document.stats = stats_.attributes.gameModeStats[gameMode]
                        const key = cacheKey.buildKey([shard, season, gameMode, accountIdFromAPI])
                        obj.statsToCache.push({key: key, value: JSON.stringify(document)});
                        if (seasonDoc !== null && !seasonDoc.isCurrentSeason) {
                            documents.push(document)
                        }
                    }
                })
            }
        }))

        await insertStatsIntoMongo(documents, season);
        await Promise.all(obj.statsToCache.map(async item => {
            try {
                await cache.insertKey(item.key, item.value, 1800);
            } catch (error) {
                console.log("failed to insert stats into cache");
            }
        }))
    }

    return obj;
}

insertStatsIntoMongo = async (documents, season) => {
    if (season !== "lifetime" && documents.length > 0) {
        try {
            await mongodb.insertMany("PUBG", "PlayerStats", documents);
        } catch (error) {
            console.log("Failed to insert stats into mongodb");
            console.log(error.message);
        }
    }
}