const { SlashCommandBuilder } = require('@discordjs/builders');
const api = require('../utility/pubg/api');
const factory = require('../commands-helper/seasons-embed-factory');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('seasons')
        .setDescription('Shows a list of seasons.')
        .addStringOption(option =>
            option
                .setName('platform')
                .setDescription('This will display season ids for this specific platform.')
                .setRequired(true)
                .addChoice("Steam", "steam")
                .addChoice("Playstation", "psn")
                .addChoice("Xbox", "xbox")
                .addChoice("Kakao", "kakao")
                .addChoice("Stadia", "stadia")
        ),

    async execute(interaction) {

        await interaction.deferReply({ ephemeral: true });

        const shard = interaction.options.getString('platform');
        const url = `http://localhost:3000/api/shard/${shard}/seasons`;

        console.log("URL: ", url);
        const seasons = await api.fetchData(url, 5000, false, "GET");
        
        const obj = factory.createEmbedFactory(shard, seasons);
        
        await interaction.editReply(obj);
    }
}