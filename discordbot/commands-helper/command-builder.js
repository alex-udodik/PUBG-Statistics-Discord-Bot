const backend = require('../utility/api')
const { SlashCommandBuilder } = require('@discordjs/builders');
const nameSimplifier = require("../utility/pubg/season-names-simplified");

module.exports = {

    async getParticularSlashCommand(shard) {
        var url = `http://localhost:3000/api/shard/${shard}/seasons`
        const seasons = await backend.fetchData(url, 6500, null, "GET")
        const size = seasons.length > 25 ? 25 : seasons.length;

        return new SlashCommandBuilder()
            .setName(`stats-${shard}`)
            .setDescription(`Fetches stats on the ${shard} platform`)
            .addSubcommandGroup(group => {
                group.setName("unranked")
                group.setDescription(`Fetches unranked stats of ${shard} players`)
                group.addSubcommand(subCommand => {
                    subCommand.setName("one-season")
                    subCommand.setDescription(`Fetches unranked stats of ${shard} players for a particular season`)
                    subCommand.addStringOption(option => {
                        option.setName("season")
                        option.setDescription("The stats for this season will be queried")
                        option.setRequired(true)

                        const nameSimplifier = require('../utility/pubg/season-names-simplified')
                        for (var i = size - 1, j = seasons.length - 1; i >= 0 && j >= 0; j--){
                            var pair = nameSimplifier.getSimplifiedSeasonName(shard, seasons[j].id, false)
                            if (pair !== undefined) {
                                option.addChoice(pair.name, pair.seasonId)
                                i--;
                            }
                        }
                        option.addChoice("Lifetime", "lifetime")
                        return option
                    })
                    subCommand.addStringOption(option => option
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
                    subCommand.addStringOption(option =>
                        option
                            .setName('names')
                            .setDescription('Case-sensitive for 1st-time names! Max 10 names. Ex: TGLTN shroud')
                            .setRequired(true)
                    )
                    return subCommand
                })
                group.addSubcommand(subCommand => {
                    subCommand.setName("graph-fragger")
                    subCommand.setDescription(`Fetches fragger rating of a single player from all seasons`)
                    subCommand.addStringOption(option => option
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
                    subCommand.addStringOption(option =>
                        option
                            .setName('names')
                            .setDescription('Case-sensitive for 1st-time names! Max 1 name.')
                            .setRequired(true)
                    )
                    return subCommand
                })
                group.addSubcommand(subCommand => {
                    subCommand.setName("graph-revives")
                    subCommand.setDescription(`Fetches revives-per-min of a single player from all seasons`)
                    subCommand.addStringOption(option => option
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
                    subCommand.addStringOption(option =>
                        option
                            .setName('names')
                            .setDescription('Case-sensitive for 1st-time names! Max 1 name.')
                            .setRequired(true)
                    )
                    return subCommand
                })
                return group;
            })
            .addSubcommandGroup(group => {
                group.setName("ranked")
                group.setDescription(`Fetches ranked stats of a single ${shard} player for a particular season`)
                group.addSubcommand(subCommand => {
                    subCommand.setName("one-season")
                    subCommand.setDescription(`Fetches ranked stats of a single ${shard} player for a particular season`)
                    subCommand.addStringOption(option => {
                        option.setName("season")
                        option.setDescription("The stats for this season will be queried")
                        option.setRequired(true)
                        //TODO: proper season names.

                        const nameSimplifier = require('../utility/pubg/season-names-simplified')
                        for (var i = size - 1, j = seasons.length - 1; i >= 0 && j >= 0; j--){
                            var pair = nameSimplifier.getSimplifiedSeasonName(shard, seasons[j].id, true)
                            if (pair !== undefined) {
                                option.addChoice(pair.name, pair.seasonId)
                                i--;
                            }
                        }
                        return option
                    })
                    subCommand.addStringOption(option => option
                        .setName("game-mode")
                        .setDescription("Choose a game-mode")
                        .setRequired(true)
                        .addChoice("FPP Squad", "squad-fpp")
                        .addChoice("FPP Solo", "solo-fpp")
                        .addChoice("TPP Squad", "squad")
                        .addChoice("TPP Solo", "solo")
                    )
                    subCommand.addStringOption(option =>
                        option
                            .setName('names')
                            .setDescription('Case-sensitive for 1st-time names! Max 1 name. Ex: summit1g')
                            .setRequired(true)
                    )
                    return subCommand
                })
                return group;
            })
    }
}