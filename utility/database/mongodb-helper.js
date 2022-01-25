

module.exports = {

    insertOne: async function (database, collection, document) {
        try {
        
            const mongodbDatabase = global.mongodb.db(database);
            const mongodbCollection = mongodbDatabase.collection(collection);

            const result = await mongodbCollection.insertOne(document);
            console.log(`A document was inserted with the _id: ${result.insertedId}`);
            return result.acknowledged;
        } finally {
           
        }
    },

    findOne: async function (database, collection, query) {
        try {
            
            const mongodbDatabase = global.mongodb.db(database);
            const mongodbCollection = mongodbDatabase.collection(collection);

            const name = await mongodbCollection.findOne(query);
            console.log(query, `was able to find: `, name);
            return name;
        } finally {
            
        }
    },

    findOne: async function (database, collection, query, options) {
        try {
            
            const mongodbDatabase = global.mongodb.db(database);
            const mongodbCollection = mongodbDatabase.collection(collection);

            const name = await mongodbCollection.findOne(query, options);
            console.log(query, `was able to find: `, name);
            return name;
        } finally {
           
        }
    },




}