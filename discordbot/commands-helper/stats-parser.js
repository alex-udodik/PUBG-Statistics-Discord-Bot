const statsCalc = require('../utility/pubg/stats');

module.exports = {

    getCalculatedStats: function(stats) {
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
    
        const obj = {
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
    
        return obj 
    }
}