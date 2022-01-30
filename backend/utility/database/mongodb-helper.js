const MongoDBSingleton = require('./mongodb-singleton');

module.exports = {
    insertOne: async function (database, collection, document, options) {
        try {
            const mongodbCollection = getCollection(database, collection);
            const result = await mongodbCollection.insertOne(document);
            console.log(`A document was inserted with the _id: ${result.insertedId}`);

            return result.acknowledged;
        } catch (error) {
            return error;
        }
    },

    insertMany: async function(database, collection, document) {
        try {
            const mongodbCollection = getCollection(database, collection);
            return await mongodbCollection.insertMany(document);
        } catch (error) {
            return error;
        }
    },

    findOne: async function (database, collection, query, options) {
        try {
            const mongodbCollection = getCollection(database, collection);
            let name;
            if (typeof options === "undefined") { name = await mongodbCollection.findOne(query, options); }
            else { name = await mongodbCollection.findOne(query); }

            console.log(query, `was able to find: `, name);
            return name;
        } catch (error) {
            return error;
        }
    },

    findMany: async function (database, collection, query, options) {
        try {
            const mongodbCollection = getCollection(database, collection);
            return await mongodbCollection.find(query);
        } catch (error) {
            return error;
        }
    },
}

const getCollection = function(database, collection) {
    const databaseInstance = MongoDBSingleton.getInstance()
    const mongodbDatabase = databaseInstance.db(database);
    return mongodbDatabase.collection(collection);
}