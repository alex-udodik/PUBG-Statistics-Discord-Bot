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
            seasons.push(season);
        })

        return seasons;
    }
}