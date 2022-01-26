const MongoDBSingleton = require('./mongodb-singleton');

module.exports = {

    getCollection: function(database, collection) {
        const databaseInstance = MongoDBSingleton.getInstance()
        const mongodbDatabase = databaseInstance.db(database);
        return mongodbDatabase.collection(collection);
    },

    insertOne: async function (database, collection, document) {
        try {
            const mongodbCollection = this.getCollection(database, collection);

            const result = await mongodbCollection.insertOne(document);
            console.log(`A document was inserted with the _id: ${result.insertedId}`);
            return result.acknowledged;
        } finally {

        }
    },

    findOne: async function (database, collection, query, options) {
        try {

            const mongodbCollection = this.getCollection(database, collection);

            var name;
            if (typeof options === "undefined") { name = await mongodbCollection.findOne(query, options); }
            else { name = await mongodbCollection.findOne(query); }

            console.log(query, `was able to find: `, name);
            return name;

        } finally {

        }
    },

    findMany: async function (database, collection, query, options) {

        try {
            const mongodbCollection = this.getCollection(database, collection);
            const cursor = await mongodbCollection.find(query);
            await cursor.forEach(doc => console.log(doc));
            
        } finally {

        }
    },
}