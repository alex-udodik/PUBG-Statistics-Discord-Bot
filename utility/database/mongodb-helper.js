const MongoDBSingleton = require('./mongodb-singleton');

module.exports = {

    insertOne: async function (database, collection, document) {
        try {

            const databaseInstance = MongoDBSingleton.getInstance()
            const mongodbDatabase = databaseInstance.db(database);
            const mongodbCollection = mongodbDatabase.collection(collection);

            const result = await mongodbCollection.insertOne(document);
            console.log(`A document was inserted with the _id: ${result.insertedId}`);
            return result.acknowledged;
        } finally {

        }
    },


    findOne: async function (database, collection, query, options) {
        try {

            const databaseInstance = MongoDBSingleton.getInstance()
            const mongodbDatabase = databaseInstance.db(database);
            const mongodbCollection = mongodbDatabase.collection(collection);

            var name;
            if (typeof options === "undefined") {name = await mongodbCollection.findOne(query, options);}
            else {name = await mongodbCollection.findOne(query);}

            console.log(query, `was able to find: `, name);
            return name;

        } finally {

        }
    },




}