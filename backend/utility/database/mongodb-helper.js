const MongoDBSingleton = require('./mongodb-singleton');
const {MongoError} = require("mongodb");

module.exports = {
    insertOne: async function (database, collection, document, options) {
        try {
            const mongodbCollection = getCollection(database, collection);
            const result = await mongodbCollection.insertOne(document);
            console.log(`A document was inserted with the _id: ${result.insertedId}`);

            return result.acknowledged;
        } catch (error) {
            console.log(error.message)
            throw new MongoError(`Failed to insert ${document} into ${database}.${collection}`);
        }
    },

    insertMany: async function(database, collection, document) {
        try {
            const mongodbCollection = getCollection(database, collection);
            return await mongodbCollection.insertMany(document);
        } catch (error) {
            console.log(error.message)
            throw new MongoError(`Failed to insert ${document} into ${database}.${collection}`);
        }
    },

    findOne: async function (database, collection, query, options) {
        try {
            const mongodbCollection = getCollection(database, collection);
            let name;
            if (typeof options === "undefined") { name = await mongodbCollection.findOne(query, options); }
            else { name = await mongodbCollection.findOne(query); }
            return name;
        } catch (error) {
            console.log(error.message)
            throw new MongoError(`Failed to find ${query} from ${database}.${collection}`);
        }
    },

    findMany: async function (database, collection, query, options) {
        try {
            const mongodbCollection = getCollection(database, collection);
            return await mongodbCollection.find(query, options);
        } catch (error) {
            console.log(error.message)
            throw new MongoError(`Failed to find ${query} from ${database}.${collection}`);
        }
    },
}

const getCollection = function(database, collection) {
    try {
        const databaseInstance = MongoDBSingleton.getInstance()
        const mongodbDatabase = databaseInstance.db(database);
        return mongodbDatabase.collection(collection);
    } catch (error) {
        console.log(error)
        throw new MongoError(`There was an error fetching the mongo instance.`);
    }
}