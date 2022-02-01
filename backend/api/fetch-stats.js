const api = require('../utility/pubg/api');

module.exports = {

    fetchStats: async function (obj, season, gameMode, ranked) {

        var urlPreJoin = [`https://api.pubg.com/shards/steam/seasons/${season}/gameMode/${gameMode}/players?filter[playerIds]=`];

        if (ranked) {
            urlPreJoin = [`https://api.pubg.com/shards/steam/seasons/${season}/gameMode/${gameMode}/ranked/players?filter[playerIds]=`]
        }

        obj.validAccounts.forEach(account => { urlPreJoin.push(`${account.accountId},`); })
        var url = urlPreJoin.join("");
        url = url.slice(0, -1);

        const results = await api.fetchData(url, 5000);

        if ('errors' in results) { return { APIError: true, details: "Fetching stats" } }
        if (results instanceof Error) { return { APIError: true, details: "PUBG API" } }
        else {
            obj.validAccounts.forEach(account => {
                results.data.forEach(stats => {
                    var accountIdFromAPI = stats.relationships.player.data.id;
                    var accountIdInput = account.accountId;

                    if (accountIdFromAPI === accountIdInput) {
                        account.rawStats = stats.attributes.gameModeStats[gameMode];
                    }
                })
            })
        }

        return obj;
    }
}