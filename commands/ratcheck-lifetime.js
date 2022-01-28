const { SlashCommandBuilder } = require('@discordjs/builders');
const AccountVerificationHandler = require('../commands-helper/account-verification');
const statsParser = require('../commands-helper/stats-parser');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ratcheck-lifetime')
        .setDescription('Shows the rat rating for lifetime stats of a pubg player')
        .addStringOption(option =>
            option
                .setName('names')
                .setDescription('Case-sensitive for 1st-time names! Max 10 names. Ex: DallasCowboy TGLTN shroud')
                .setRequired(true)
        ),

    async execute(interaction) {

        await interaction.deferReply({ ephemeral: true });

        const fail_message = "Accounts failed fetch from API (DNE or missing upper/lower case):";

        const pubg_name = interaction.options.getString('names');
        const names = pubg_name.split(/[ ,]+/)

        if (names.length > 10) {
            await interaction.editReply(`Exceeded number of names. (Max 10)`)
        }
        else {
            
            var ratings = new AccountVerificationHandler(names);
            const verifiedNames = await ratings.getAccounts();

            if (verifiedNames === "Error") {
                await interaction.editReply(`There was an error with connecting to the PUBG API.`)
                return;
            }
            console.log("verifiednames: ", verifiedNames);
            if (verifiedNames.failedAPILookUp === true && verifiedNames.verifiedAccounts === false) {
                
                var description = [];
                verifiedNames.accountsFailedAPILookUp.forEach(name => {
                    description.push(`\n\u2022${name}`);
                })

                var embed = {
                    title: fail_message,
                    description: description.join("")
                }
                await interaction.editReply({ embeds: [embed] })
            } else {
                const namesWithStats = await statsParser.addStats(verifiedNames.accounts, "lifetime", "squad-fpp", false);
                if (namesWithStats === "Error") {
                    await interaction.editReply(
                       `There was an error with connecting to the PUBG API.`
                    )
                    return;
                }
                var fields = [];
                var footer = [fail_message];

                namesWithStats.forEach(account => {

                    if (account.accountId != null) {
                        var item = [];
                        for (const [key, value] of Object.entries(account.calcedStats)) {
                            item.push(`${key}: ${value}\n`);
                        }
                        const value = item.join("");
                        const field = {
                            name: account.name,
                            value: value,
                            inline: true
                        }
                        fields.push(field);
                    }

                    if (account.accountId === null) { footer.push(`\n\u2022${account.name}`); }
                })

                var embed = {
                    title: "Lifetime stats",
                    fields: fields,
                    footer: { text: (footer.length > 1) ? footer.join("") : "" }
                }

                console.log("names with stats: ", namesWithStats);
                await interaction.editReply(
                    { embeds: [embed] }
                )
            }
        }

        return;
    }
}