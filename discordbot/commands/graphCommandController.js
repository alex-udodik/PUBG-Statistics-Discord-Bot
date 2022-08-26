const api = require('../utility/api')
const {MessageEmbed, MessageAttachment} = require("discord.js");

module.exports = {

    async runCommand(interaction) {
        const group = interaction.options._group;
        const shard = interaction.commandName.replace("stats-", "")
        const gameMode = interaction.options.getString("game-mode")
        const statType = interaction.options._subcommand.replace("graph-", "")

        const names = interaction.options.getString("names").split(/[ ,]+/)
        let ranked = false

        const payload = {
            applicationId: String(interaction.applicationId),
            guildId: String(interaction.guildId),
            channelId: String(interaction.channelId),
            userId: String(interaction.user.id),
            commandId: String(interaction.commandId),
            commandName: String(interaction.commandName),
            subCommandName: String(interaction.options._subcommand),
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
            `http://localhost:3000/api/graph/${statType}/shard/${shard}/gameMode/${gameMode}/ranked/${ranked}/players?array=${names}`,
            180000,  payload, "POST"
        )

        if (url.statusCode !== 200) {
            return url.message
        }

        var embed = new MessageEmbed();
        if (url.invalidAccounts.length > 0) {
            embed.setTitle(`Accounts failed fetch from API (DNE or missing upper/lower case)`)
            embed.setDescription(`\n\u2022${url.invalidAccounts[0].name}`)
            embed.setColor('#960018')
        }
        else {
            embed.setTitle(`${url.displayName}`)
            embed.setImage(url.url)
            embed.setColor(url.embedColor)
            embed.setDescription(url.description)
            embed.setFooter("Graph generated with QuickCharts")
        }

        return {embeds: [embed]}

    }
}