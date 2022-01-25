const { default: dist } = require("@node-redis/search");
const { parse } = require("dotenv");


module.exports = {


    getAdr: function(damage, rounds) {
        return parseInt(parseFloat(damage) / parseFloat(rounds));
    },

    getWalkDistance: function(distance, rounds, unit) {

        if (unit === "km") {
            return (parseFloat(distance) / parseFloat(rounds)).toFixed(2);
        }
        else {
            return ((parseFloat(distance) / parseFloat(rounds)) / 1000).toFixed(2);
        }
    },

    getTimeSurvived: function(timeSurvived, rounds) {
        return (parseFloat(timeSurvived) / parseFloat(rounds));
    },

    getWinPercent: function(wins, rounds) {
        return (parseFloat(wins) / parseFloat(rounds)).toFixed(1);
    },

    getRatRating: function() {

    }
}