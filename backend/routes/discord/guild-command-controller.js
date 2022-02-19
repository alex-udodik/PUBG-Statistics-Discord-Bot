const mongo = require('../../utility/database/mongodb-helper')

module.exports = {

    async post(document) {
        try {
            await mongo.insertOne("DiscordBot-PubgStats", "GuildCommands", document, null)
        } catch (error) {
            console.log(error.message);
            return false;
        }

        return true;
    },

    async patch(document) {

        try {
            const options = {upsert: false}
            const filter = {_id: document._id}
            const updateDoc = {$set: document.query};
            await mongo.updateOne("DiscordBot-PubgStats", "GuildCommands", updateDoc, filter, options)
        } catch (error) {
            console.log(error.message)
            return false;
        }

        return true;
    },

    async delete(guildId) {

        try {
            const query = {_id: guildId}
            await mongo.deleteOne("DiscordBot-PubgStats", "GuildCommands", query, null)
        } catch (error) {
            console.log(error.message)
            return false
        }

        return true;
    },
}