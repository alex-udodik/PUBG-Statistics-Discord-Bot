const mongo = require('../../backend/utility/database/mongodb-helper')

class BotAnalytics {
    constructor(interaction, isRateLimited) {
        this.applicationId = interaction.applicationId;
        this.guildId = interaction.guildId;
        this.channelId = interaction.channelId;
        this.userId = interaction.user.id;
        this.commandName = interaction.commandName;
        this.commandId = interaction.commandId;
        this.options = interaction.options;
        this.date = interaction.createdAt;
        this.isRateLimited = isRateLimited
    }

    async send(database, table) {

        const document = {
            applicationId: this.applicationId,
            guildId: this.guildId,
            channelId: this.channelId,
            userId: this.userId,
            commandName: this.commandName,
            commandId: this.commandId,
            options: this.options._hoistedOptions,
            date: this.date,
            isRateLimited: this.isRateLimited
        }

        try {
            const result = await mongo.insertOne(database, table, document)
        } catch (error) {
            console.log(`There was an error inserting a document to ${database}.${table}`);
        }
    }

}

module.exports = BotAnalytics