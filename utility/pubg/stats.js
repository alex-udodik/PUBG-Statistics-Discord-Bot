const { default: dist } = require("@node-redis/search");
const { parse } = require("dotenv");


module.exports = {


    getAdr: function(damage, rounds) {
        return parseFloat(parseFloat(damage) / parseFloat(rounds));
    },

    getAvgDistanceTraveled: function(distance, rounds, unit) {

        if (unit === "km") {
            return parseFloat((parseFloat(distance) / parseFloat(rounds)) / 1000);
        }
        else {
            return parseFloat((parseFloat(distance) / parseFloat(rounds)));
        }
    },

    getTimeSurvived: function(timeSurvived, rounds, unit) {
        if (unit === "m") {
            return parseFloat(parseFloat(timeSurvived) / parseFloat(60) / parseFloat(rounds));
        }
        else {
            return parseFloat(parseFloat(timeSurvived) / parseFloat(rounds));
        }
        
    },

    getWinPercent: function(wins, rounds) {
        return parseFloat(parseFloat(wins) / parseFloat(rounds));
    },

    getHeadShotPercent: function(headshotKills, totalKills) {
        return parseFloat(parseFloat(headshotKills) / parseFloat(totalKills))
    },

    getRatRating: function(stats_data) {

        //(((TimeSurvived)(1+Win%))ADR)/(Avg_Walk+Avg_Drive)*10


        console.log("Stats: ", stats_data.data.attributes.gameModeStats['squad-fpp']);
        const stats = stats_data.data.attributes.gameModeStats['squad-fpp']

        const adr = this.getAdr(stats.damageDealt, stats.roundsPlayed);
        const mins_survived = this.getTimeSurvived(stats.timeSurvived, stats.roundsPlayed, "m");
        const win_ratio = this.getWinPercent(stats.wins, stats.roundsPlayed);

        const avg_walk = this.getAvgDistanceTraveled(stats.walkDistance, stats.roundsPlayed, "km");
        const avg_drive = this.getAvgDistanceTraveled(stats.rideDistance, stats.roundsPlayed, "km");
        
        console.log("adr: ", adr);
        console.log("mins survived: ", mins_survived);
        console.log("win ratio: ", win_ratio);
        console.log("avg travel (walk): ", avg_walk);
        console.log("avg travel (drive): ", avg_drive);
        
        const rating = (((mins_survived) * (1 + win_ratio)) * adr) / ((avg_walk + avg_drive) * 10);

        console.log("Rat rating: ", rating);
        return rating;
    }
}