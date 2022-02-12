const mongo = require('../utility/database/mongodb-helper')

module.exports = {

    isSeasonValid: async function(season, shard) {

        const query = {id: season};
        const result = await mongo.findOne("PUBG", `Seasons-${shard}`, query)

        return result !== null;
    },

    isSeasonCurrent: async function(season, shard) {
        const query = {id: season};
        const result = await mongo.findOne("PUBG", `Seasons-${shard}`, query)

        if (result !== null && "isCurrentSeason" in result) {
            if (result.isCurrentSeason) {
                return true;
            }
        }

        return false;
    }
}