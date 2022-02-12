const {SlashCommandBuilder} = require('@discordjs/builders');
const {MessageEmbed, MessageAttachment} = require('discord.js');
const api = require('../utility/pubg/api');
const statsParser = require('../commands-helper/stats-parser');
const rankedIconGetter = require('../commands-helper/ranked-icon-getter');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stat-check-ranked')
        .setDescription('Shows the ranked stats of a single PUBG player')
        .addStringOption(option =>
            option
                .setName('platform')
                .setDescription('This will search for players playing on this specific platform.')
                .setRequired(true)
                .addChoice("Steam", "steam")
                .addChoice("Playstation", "psn")
                .addChoice("Xbox", "xbox")
                .addChoice("Kakao", "kakao")
                .addChoice("Stadia", "stadia")
        )

        //TODO: need ranked only seasons list.
        .addStringOption(option =>
            option
                .setName('season')
                .setDescription('Use latest for current season. Use /seasons for list of seasons. ')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("game-mode")
                .setDescription("Choose a game-mode")
                .setRequired(true)
                .addChoice("FPP Squad", "squad-fpp")
                .addChoice("FPP Solo", "solo-fpp")
                .addChoice("TPP Squad", "squad")
                .addChoice("TPP Solo", "solo")
        )
        .addStringOption(option =>
            option
                .setName('name')
                .setDescription('Case-sensitive for 1st-time names! Max 1 name. Ex: summit1g')
                .setRequired(true)
        ),

    async execute(interaction) {

        await interaction.deferReply({ephemeral: true});

        const pubg_name = interaction.options.getString('name');
        const names = pubg_name.split(/[ ,]+/)

        if (names.length > 1) {
            await interaction.editReply(`Exceeded number of names. (Max 1)`)
            return;
        }
        const shard = interaction.options.getString('platform');
        const season = interaction.options.getString('season');
        const gameMode = interaction.options.getString('game-mode');

        const url = `http://localhost:3000/api/shards/${shard}/players/${names[0]}/seasons/${season}/gameMode/${gameMode}/ranked`;
        const response = await api.fetchData(url, 7500, "GET");

        if ('APIError' in response) {
            const details = response.details;
            await interaction.editReply(`There was an error involving ${details}`)
            return;
        }

        var attachment;

        var embed = new MessageEmbed();
        if (response.validAccounts.length > 0) {

            await Promise.all(response.validAccounts.map(async account => {
                account.calcedStats = (account.rawStats !== null ?
                    statsParser.getCalculatedStatsRanked(account.rawStats) :
                    statsParser.getDummyDataRanked());
                var item = [];
                for (const [key, value] of Object.entries(account.calcedStats)) {
                    item.push(`${key}: ${value}\n`);
                }
                const value = item.join("");
                const field = {name: gameMode, value: value, inline: true}

                const filePath = await rankedIconGetter.get(account.calcedStats.currentRankPoint)
                attachment = new MessageAttachment(filePath);
                const pathSplit = String(filePath).split("/")
                const img = pathSplit[pathSplit.length - 1]

                embed.setTitle(`Ranked stats for ${account.displayName}`)
                embed.setDescription(`Platform: ${shard}\nSeason: ${season}`);
                embed.setThumbnail(`attachment://${img}`);
                embed.addFields(field);
            }))
        } else {
            const fail_message = "Account failed fetch from API (DNE or missing upper/lower case):";
            namesThatFailedLookUp = [];
            response.invalidAccounts.forEach(name_ => {
                namesThatFailedLookUp.push(`\n\u2022${name_.name}`);
            })
            embed.setTitle(fail_message);
            embed.setDescription(namesThatFailedLookUp.join(""));

            await interaction.editReply(
                {embeds: [embed]}
            )
            return;
        }

        await interaction.editReply(
            {embeds: [embed], files: [attachment]}
        )
    }
}