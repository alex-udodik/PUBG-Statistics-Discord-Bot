const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ratcheck')
        .setDescription('Check if a PUBG player is a rat.')
        .addStringOption(option =>
            option
                .setName('pubg-ign')
                .setDescription('Case-sensitive! Example: DallasCowboy')
                .setRequired(true)
        ),

    async execute(interaction) {

        await interaction.deferReply({ ephemeral: true });
        
        await interaction.editReply('Results');    
    }
}