const api = require('../utility/api')
const {MessageEmbed, MessageAttachment} = require("discord.js");

module.exports = {

    async runCommand(interaction) {
        const group = interaction.options._group;
        const shard = interaction.commandName.replace("stats-", "")
        const gameMode = interaction.options.getString("game-mode")
        const names = interaction.options.getString("names").split(/[ ,]+/)
        let ranked = false

        const payload = {
            applicationId: String(interaction.applicationId),
            guildId: String(interaction.guildId),
            channelId: String(interaction.channelId),
            userId: String(interaction.user.id),
            commandId: String(interaction.commandId),
            commandName: String(interaction.commandName),
            options: interaction.options._hoistedOptions,
            date: interaction.createdAt,
        }

        if (names.length > 1) {
            return "Exceeded number of names for unranked (Max 10)"
        }
        if (group === "ranked") {
            ranked = true
        }

        const url = await api.fetchData(
            `http://localhost:3000/api/allSeasonStats/shard/${shard}/gameMode/${gameMode}/ranked/${ranked}/players?array=${names}`,
            180000,  payload, "POST"
        )

        var embed = new MessageEmbed();
        embed.setImage(url)
        embed.setTitle(`Unranked ${names}`)
        embed.setDescription("This is a test description")


        return {embeds: [embed]}

    }
}