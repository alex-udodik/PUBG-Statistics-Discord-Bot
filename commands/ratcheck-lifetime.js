const { SlashCommandBuilder } = require('@discordjs/builders');
const AccountVerificationHandler = require('../commands-helper/account-verification');


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

        
        //https://api.pubg.com/shards/steam/seasons/lifetime/gameMode/squad-fpp/players?filter[playerIds]=account.11395d32968f4e43842c7e1317afd1b9,account.b92bd758b729428f8e5f4faeeeee0348
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
            
            await interaction.editReply(
                `Not implemented.`
            )
        }

        return;
    }
}