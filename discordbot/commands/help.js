const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Shows different ways to use commands.'),

    async execute(interaction) {

        await interaction.deferReply({ ephemeral: true });

        await interaction.editReply('Help results (Not yet implemented)');    
    }
}