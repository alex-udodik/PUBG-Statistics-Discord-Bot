const { MongoClient } = require('mongodb');
const mongodbURI = `mongodb+srv://${process.env.MONGO_DB_USERNAME}:${process.env.MONGO_DB_PASSWORD}@clusterdev0.pcdo6.mongodb.net/test`;

module.exports = {

    insertOne: async function (database, collection, document) {

        const client = new MongoClient(mongodbURI);

        try {
            await client.connect();

            const mongodbDatabase = client.db(database);
            const mongodbCollection = mongodbDatabase.collection(collection);

            const result = await mongodbCollection.insertOne(document);
            console.log(`A document was inserted with the _id: ${result.insertedId}`);
            return result;
        } finally {
            await client.close();
        }
    },

    findOne: async function (database, collection, query) {
        const client = new MongoClient(mongodbURI);

        try {
            await client.connect();

            const mongodbDatabase = client.db(database);
            const mongodbCollection = mongodbDatabase.collection(collection);

            const name = await mongodbCollection.findOne(query);
            console.log(`${query} was able to find: ${name}`);
            return name;
        } finally {
            await client.close();
        }
    },

    findOne: async function (database, collection, query, options) {
        const client = new MongoClient(mongodbURI);

        try {
            await client.connect();

            const mongodbDatabase = client.db(database);
            const mongodbCollection = mongodbDatabase.collection(collection);

            const name = await mongodbCollection.findOne(query, options);
            console.log(`${query} was able to find: ${name}`);
            return name;
        } finally {
            await client.close();
        }
    },




}