const api = require('../utility/pubg/api');
const statsCalc = require('../utility/pubg/stats');

module.exports = {

    addStats: async function (accounts, season, gameMode, ranked) {
        if (!ranked) {
            const urlPreJoin = [`https://api.pubg.com/shards/steam/seasons/${season}/gameMode/${gameMode}/players?filter[playerIds]=`];

            accounts.forEach(account => { urlPreJoin.push(`${account.accountId},`); })
            var url = urlPreJoin.join("");
            url = url.slice(0, -1);

            const results = await api.fetchData(url, 5000);

            console.log("Results from api (fetching stats): ", results);
            
            if ('errors' in results) {return "Failed to look up name."};
            if (results instanceof Error) {  return "Error"; }
            else {
                accounts.forEach(account => {
                    results.data.forEach(stats => {
                        var accountIdFromAPI = stats.relationships.player.data.id;
                        var accountIdInput = account.accountId;

                        if (accountIdFromAPI === accountIdInput) {
                            account.rawStats = stats.attributes.gameModeStats[gameMode];
                        }
                    })
                })

                console.log("Stats before calculations: ", accounts);
                accounts.forEach(account => {
                    if (account.accountId !== null) {
                        account.calcedStats = parseStats(account.rawStats);
                    }
                })
                return accounts;
            }
        }
    }
}

const parseStats = (stats) => {

    const rounds = stats.roundsPlayed;
    const adr = parseFloat(statsCalc.getAdr(stats.damageDealt, rounds)).toFixed(2);
    const winRate = parseFloat(statsCalc.getWinPercent(stats.wins, rounds) * 100).toFixed(2);
    const timeSurvived = statsCalc.getTimeSurvived(stats.timeSurvived, rounds, "m").toFixed(2);
    const hsRatio = parseFloat(statsCalc.getHeadShotPercent(stats.headshotKills, stats.kills) * 100).toFixed(2);
    const suicides = stats.suicides;
    const teamkills = stats.teamKills;
    const longestKill = parseFloat(stats.longestKill).toFixed(2);
    //const rat_rating = 

    const obj = {
        rounds: rounds,
        adr: adr,
        winRate: winRate,
        timeSurvived: timeSurvived,
        hsRatio: hsRatio,
        suicides: suicides,
        teamkills: teamkills,
        longestKill: longestKill
    }

    return obj 
}