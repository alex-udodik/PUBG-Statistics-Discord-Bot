const { MongoClient } = require('mongodb');

var MongoDBSingleton = (function () {

    var instance;
    var count = 0;
    function createInstance() {
        const mongodbURI = `mongodb+srv://***REMOVED***:${process.env.MONGO_DB_PASSWORD}@clusterdev0.pcdo6.mongodb.net/test`;
        var object = new MongoClient(mongodbURI);
        count += 1;
        return object;
        
    }

    return {
        getInstance: function() {
            if (!instance) {
                instance = createInstance();
            }

            console.log("Mongodb instance count: ", count);
            return instance;
        }
    };
})();

module.exports = MongoDBSingleton;