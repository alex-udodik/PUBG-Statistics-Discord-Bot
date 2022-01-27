const api = require('../utility/pubg/api');

module.exports = {

    addStats: async function(accounts, season, gameMode, ranked) {

        console.log("accounts: ", accounts);
        if (!ranked) {
            const urlPreJoin = [`https://api.pubg.com/shards/steam/seasons/${season}/gameMode/${gameMode}/players?filter[playerIds]=`];

            accounts.forEach(account => {
                urlPreJoin.push(`${account.accountId},`);
            })

            var url = urlPreJoin.join("");
            url = url.slice(0, -1);

            const results = await api.fetchData(url);
            console.log("RESults: ", results);
            if ('errors' in results) {
                return "Fetch from API failed. The name does not exist.";
            }
            else {
                accounts.forEach(account => {
                    results.data.forEach(stats => {
                        var accountIdFromAPI = stats.relationships.player.data.id;
                        var accountIdInput = account.accountId;

                        if (accountIdFromAPI === accountIdInput) {
                            account.stats = stats.attributes.gameModeStats[gameMode];
                        }
                    })
                })

                return accounts;
            }
        }
    }
}