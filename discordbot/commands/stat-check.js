const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const api = require('../utility/pubg/api');
const statsParser = require('../commands-helper/stats-parser');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stat-check')
        .setDescription('Shows the stats of a pubg player')
        .addStringOption(option =>
            option
                .setName('names')
                .setDescription('Case-sensitive for 1st-time names! Max 10 names. Ex: TGLTN shroud')
                .setRequired(true)
        ),

    async execute(interaction) {

        await interaction.deferReply({ ephemeral: true });

        const pubg_name = interaction.options.getString('names');
        const names = pubg_name.split(/[ ,]+/)

        if (names.length > 10) {
            await interaction.editReply(`Exceeded number of names. (Max 10)`)
            return;
        }

        const payload = {
            names: names,
            type: {
                "ranked": false,
                "season": "lifetime",
                "gameMode": "squad-fpp"
            }
        }

        const url = 'http://localhost:3000/api/unranked/stats';
        const response = await api.fetchData(url, 7500, payload);

        if ('APIError' in response) {
            const details = response.details;
            await interaction.editReply(`There was an error involving ${details}`)
            return;
        }

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
}