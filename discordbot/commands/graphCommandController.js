const api = require('../utility/api')
const {MessageEmbed} = require("discord.js");
const imageDownloader = require('../utility/save-img.js')

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

        //TODO add player name verification

        if (names.length > 1) {
            return "Only 1 player name is allowed for graph."
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
        const imageName = `${names}${Date.now()}.png`;

        if (url.invalidAccounts.length > 0) {
            embed.setTitle(`Accounts failed fetch from API (DNE or missing upper/lower case)`)
            embed.setDescription(`\n\u2022${url.invalidAccounts[0].name}`)
            embed.setColor('#960018')

            //TODO check if file exists then return, else return error
            return {embeds: [embed]};
        }
        else {


            if (await imageDownloader.download(url.url, './assets/temp/', imageName)) {
                embed.setImage(`attachment:./assets/temp/${imageName}`)
            }


            embed.setTitle(`${url.displayName}`)
            embed.setColor(url.embedColor)
            embed.setDescription(url.description)
            embed.setImage(`attachment://${imageName}`);
            embed.setFooter("Graph generated with QuickCharts")

            //TODO check if file exists then return, else return error
            return {embeds: [embed], files: [`./assets/temp/${imageName}`]};
        }



    }
}