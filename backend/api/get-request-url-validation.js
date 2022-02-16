const mongo = require('../utility/database/mongodb-helper');

module.exports = {

    isShardValid: function(shard) {
        return shard === "steam" || shard === "psn" || shard === "xbox" || shard === "kakao" || shard === "stadia";
    },

    isGameModeValid: function(gameMode) {
        return gameMode === "solo" || gameMode === "duo" || gameMode === "squad" || gameMode === "solo-fpp"
                                    || gameMode === "duo-fpp" || gameMode === "squad-fpp"
    },

    isRankedValid: function(ranked) {
        return ranked === "true" || ranked === "false"
    },

    isSeasonValid: async function(season, shard) {
        if (season === "lifetime") {return true;}
        try {
            const document = await mongo.findOne("PUBG", `Seasons-${shard}`, {id: season});
            if (document !== null) {return true;}
        } catch (error) {
            console.log("Attempted to fetch season-id from mongodb and failed.")
            console.log(error.message)
            throw new MongoError(`Attempted to fetch season-id ${season} in Seasons-${shard} from mongodb and failed with error`)
        }

        return false;
    },

    isPlayerCountValid: function(ranked, players) {
        if (ranked && players.length === 1) {return true}
        else if (!ranked && players.length <= 10) {return true;}
        else {return false}
    }
}