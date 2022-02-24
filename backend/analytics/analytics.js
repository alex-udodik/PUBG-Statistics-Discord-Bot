const mongo = require('../utility/database/mongodb-helper')

class BotAnalytics {
    constructor(interaction, isRateLimited) {
        this.document = interaction;
        this.document.isRateLimited = isRateLimited;
    }

    async send(database, table) {
        try {
            const result = await mongo.insertOne(database, table, this.document)
        } catch (error) {
            console.log(`There was an error inserting a document to ${database}.${table}`);
        }
    }

}

module.exports = BotAnalytics