const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const api = require('../utility/pubg/api');
const statsParser = require('../commands-helper/stats-parser');
const BotAnalytics = require('../commands-helper/analytics')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stat-check-unranked')
        .setDescription('Shows the unranked stats of up to 10 PUBG players')
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
                .addChoice("FPP Duo", "duo-fpp")
                .addChoice("FPP Solo", "solo-fpp")
                .addChoice("TPP Squad", "squad")
                .addChoice("TPP Duo", "duo")
                .addChoice("TPP Solo", "solo")

        )
        .addStringOption(option =>
            option
                .setName('names')
                .setDescription('Case-sensitive for 1st-time names! Max 10 names. Ex: TGLTN shroud')
                .setRequired(true)
        ),

    async execute(interaction) {

        await interaction.deferReply({ ephemeral: true });
        var isRateLimited = false;

        const pubg_name = interaction.options.getString('names');
        const names = pubg_name.split(/[ ,]+/)

        if (names.length > 10) {
            await interaction.editReply(`Exceeded number of names. (Max 10)`)
            return;
        }
        const shard = interaction.options.getString('platform');
        const season = interaction.options.getString('season');
        const gameMode = interaction.options.getString('game-mode');
        

        const urlPreJoin = [`http://localhost:3000/api/seasonStats/shard/${shard}/seasons/${season}/gameMode/${gameMode}/ranked/${false}/players?array=`];
        names.forEach(name => {
            urlPreJoin.push(`${name},`)
        })
        var urlComma = urlPreJoin.join("");
        const url = urlComma.slice(0, -1);
        const response = await api.fetchData(url, 9999999, "GET");

        if (response.statusCode !== 200) {
            if (response.statusCode === 429) {
                isRateLimited = true;
            }
            const details = response.message;
            await interaction.editReply(details)
        }
        else {
            var embed = new MessageEmbed();
            if (response.validAccounts.length > 0) {
                response.validAccounts.forEach(account => {
                    account.calcedStats = statsParser.getCalculatedStats(account.rawStats);
                    var item = [];
                    for (const [key, value] of Object.entries(account.calcedStats)) {
                        item.push(`${key}: ${value}\n`);
                    }
                    const value = item.join("");
                    const field = { name: account.name, value: value, inline: true }
                    embed.addFields(field);
                })
            }


            const fail_message = "Accounts failed fetch from API (DNE or missing upper/lower case):";
            var namesThatFailedLookUp = [];

            if (response.validAccounts.length > 0 && response.invalidAccounts.length === 0) {
                embed.setTitle("Stats");
            }
            else if (response.validAccounts.length > 0 && response.invalidAccounts.length > 0) {
                var footer = [fail_message];

                response.invalidAccounts.forEach(name_ => {
                    namesThatFailedLookUp.push(`\n\u2022${name_.name}`);
                })

                footer.push.apply(footer, namesThatFailedLookUp);
                embed.setFooter({ text: footer.join("") });
                embed.setTitle("Stats");
            }
            else {
                response.invalidAccounts.forEach(name_ => {
                    namesThatFailedLookUp.push(`\n\u2022${name_.name}`);
                })
                embed.setTitle(fail_message);
                embed.setDescription(namesThatFailedLookUp.join(""));
            }

            await interaction.editReply(
                { embeds: [embed] }
            )
        }

        return isRateLimited;
    }
}