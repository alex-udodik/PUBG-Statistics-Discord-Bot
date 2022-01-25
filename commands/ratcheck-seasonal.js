const { SlashCommandBuilder } = require('@discordjs/builders');
const api = require('../utility/pubg/api');
const mongodb = require('../utility/database/mongodb-helper');
const cache = require('../utility/cache/cache');
const stats = require('../utility/pubg/stats');
const parse = require('../utility/parse');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ratcheck-seasonal')
        .setDescription('Shows the rat rating of a player from a particular season')
        .addStringOption(option =>
            option
                .setName("season-id")
                .setDescription("Use 'latest' or use /help command for list of season id's")
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("names")
                .setDescription("Case-sensitive for first-time names! Ex: CerBEruSXD Devmon ZeroAbyss")
                .setRequired(true)
        ),

    async execute(interaction) {

        await interaction.deferReply({ ephemeral: true });

        await interaction.editReply(
            `not implemented yet`
        )
        return;
    }



}