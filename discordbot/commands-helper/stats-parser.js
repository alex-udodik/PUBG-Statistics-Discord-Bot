const statsCalc = require('../utility/pubg/stats');

module.exports = {

    getCalculatedStats: function (stats) {
        const rounds = stats.roundsPlayed;
        const adr = parseFloat(statsCalc.getAdr(stats.damageDealt, rounds)).toFixed(2);
        const winRate = parseFloat(statsCalc.getWinPercent(stats.wins, rounds) * 100).toFixed(2);
        const timeSurvived = statsCalc.getTimeSurvived(stats.timeSurvived, rounds, "m").toFixed(2);
        const hsRatio = parseFloat(statsCalc.getHeadShotPercent(stats.headshotKills, stats.kills) * 100).toFixed(2);
        const suicides = stats.suicides;
        const teamkills = stats.teamKills;
        const longestKill = parseFloat(stats.longestKill).toFixed(2);
        const adrRaw = statsCalc.getAdr(stats.damageDealt, rounds);
        const hsRatioRaw = statsCalc.getWinPercent(stats.wins, rounds);

        const winRatio = statsCalc.getWinPercent(stats.wins, rounds);
        const timeSurivedRaw = statsCalc.getTimeSurvived(stats.timeSurvived, rounds, "m");
        const avg_walk = statsCalc.getAvgDistanceTraveled(stats.walkDistance, rounds, "km");
        const avg_drive = statsCalc.getAvgDistanceTraveled(stats.rideDistance, rounds, "km")
        const new_rating = parseFloat(statsCalc.getRatRating(timeSurivedRaw, winRatio, adrRaw, avg_walk, avg_drive)).toFixed(2);
        const old_rating = parseFloat(statsCalc.getOldFraggerRating(adrRaw, hsRatioRaw, winRatio, timeSurivedRaw)).toFixed(2);

        return {
            rounds: rounds,
            adr: adr,
            winRate: winRate,
            timeSurvived: timeSurvived,
            hsRatio: hsRatio,
            suicides: suicides,
            teamkills: teamkills,
            longestKill: longestKill,
            NewRating: new_rating,
            OldRating: old_rating
        }
    },

    getCalculatedStatsRanked: function(stats) {
        const rounds = stats.roundsPlayed;
        const wins = stats.wins;
        const avgRank = parseFloat(stats.avgRank).toFixed(2);
        const top10Ratio = parseFloat(stats.top10Ratio * 100).toFixed(2);
        const winPercent = parseFloat(statsCalc.getWinPercent(wins, rounds)).toFixed(2);
        const assists = stats.assists;
        const kda = parseFloat(stats.kda).toFixed(2);
        const adr = parseFloat(statsCalc.getAdr(stats.damageDealt, rounds)).toFixed(2);
        const kd = parseFloat(statsCalc.getKd(stats.kills, stats.deaths)).toFixed(2);

        const currentRankPoint = stats.currentRankPoint;
        const currentTier_Tier = stats.currentTier.tier;
        const currentTier_subTier = stats.currentTier.subTier;

        return {
            rounds: rounds,
            wins: wins,
            kd: kd,
            kda: kda,
            winPercent: winPercent,
            avgRank: avgRank,
            top10Ratio: top10Ratio,
            adr: adr,
            currentRankPoint: currentRankPoint,
            currentTier_Tier: currentTier_Tier,
            currentTier_subTier: currentTier_subTier
        };
    },

    getDummyDataRanked: function()  {
        return {
            currentTier:{
                tier: "N/A",
                subTier: "N/A"
            },
            currentRankPoint: -1,
            bestTier:{
                tier: "N/A",
                subTier: "N/A"
            },
            bestRankPoint: 0,
            roundsPlayed: 0,
            avgRank: 0,
            avgSurvivalTime: 0,
            top10Ratio: 0,
            winRatio: 0,
            assists: 0,
            wins: 0,
            kda: 0,
            kdr: 0,
            kills: 0,
            deaths: 0,
            roundMostKills: 0,
            longestKill: 0,
            headshotKills: 0,
            headshotKillRatio: 0,
            damageDealt: 0,
            dBNOs: 0,
            reviveRatio: 0,
            revives: 0,
            heals: 0,
            boosts: 0,
            weaponsAcquired: 0,
            teamKills: 0,
            playTime: 0,
            killStreak: 0,
        }
    }
}