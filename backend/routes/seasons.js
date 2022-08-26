const mongodb = require('../utility/database/mongodb-helper');
const QueryBuilderAnd = require('../utility/database/query-builder-and');
const QueryBuilderOr = require('../utility/database/query-builder-or');
module.exports = {

    fetchSeasons: async function(shard) {

        var queryOr = new QueryBuilderOr();
        queryOr.addQuery({type: "season"});

        const queryBuilderAnd = new QueryBuilderAnd();
        queryBuilderAnd.addOr(queryOr.build());
        const query = queryBuilderAnd.build();

        const cursor = await mongodb.findMany("PUBG", `Seasons-${shard}`, query);
        
        var seasons = [];
       
        await cursor.forEach(season => {
            if (shard === "steam" || shard === "kakao") {
                if (season.id.includes("division.bro.official.pc-")) {
                    seasons.push(season);
                }
            }
            else  {
                if (season.id.includes("division.bro.official.playstation-") ||
                    season.id.includes("division.bro.official.xbox-") ||
                    season.id.includes("division.bro.official.console-")
                    ) {
                    seasons.push(season);
                }
            }
        })

        return seasons;
    }
}