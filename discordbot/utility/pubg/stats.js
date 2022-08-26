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

    getKd: function(kills, deaths) {
        return parseFloat(parseFloat(kills) / parseFloat(deaths));
    },


    getRatRating: function(timeSurvived, winRatio, adr, avg_walk, avg_drive) {
        //(((TimeSurvived)(1+Win%))ADR)/(Avg_Walk+Avg_Drive)*10
        const rating = ((((timeSurvived) * (1 + winRatio))) * adr) / ((avg_walk + avg_drive) * 10);
        return rating;
    },

    getOldFraggerRating: function(adr, hsRatio, winRatio, survivedTime) {
        const numerator = (adr) * (1 + hsRatio);
        const denominator = (survivedTime) * (1 - winRatio)
        const rating = numerator / denominator;
        console.log("hs ratio: ", hsRatio);
        console.log("win ratio: ", winRatio);
        console.log("adr: ", adr);
        console.log("survivedTime: ", survivedTime);
        console.log("rating: ", rating);
        return rating;
    },

    getRevivesPerMin: function(revives, timeSurvivedMins) {
        return revives / timeSurvivedMins
    }

    /*      double numerator = (adr * (1 + headshotratio));
            double denominator = 1 - winratepercent;
            denominator = denominator * survivedtime;

            return numerator / denominator;
    */
}