const { SlashCommandBuilder } = require('@discordjs/builders');
const AccountVerificationHandler = require('../commands-helper/account-verification');
const statsParser = require('../commands-helper/stats-parser');
const statParser = require('../commands-helper/stats-parser');

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

        const pubg_name = interaction.options.getString('names');
        const names = pubg_name.split(/[ ,]+/)

        if (names.length > 10) {
            await interaction.editReply(
                `Exceeded number of names. (Max 10)`
            )
        }
        else {
            console.log("Names: ", names);
            var ratings = new AccountVerificationHandler(names);
            const verifiedNames = await ratings.getAccounts();
            const namesWithStats = await statsParser.addStats(verifiedNames, "lifetime", "squad-fpp", false);
            
            console.log("names with stats: ", namesWithStats);
            await interaction.editReply(
                `Not implemented.`
            )
        }

        return;
    }
}