const backend = require('../utility/api')
const { SlashCommandBuilder } = require('@discordjs/builders');

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
                group.setDescription(`Fetches unranked stats of ${shard} players for a particular season`)
                group.addSubcommand(subCommand => {
                    subCommand.setName("ez-fill")
                    subCommand.setDescription(`Fetches unranked stats of ${shard} players for a particular season`)
                    subCommand.addStringOption(option => {
                        option.setName("season")
                        option.setDescription("The stats for this season will be queried")
                        option.setRequired(true)

                        const nameSimplifier = require('../utility/pubg/season-names-simplified')
                        for (var i = size - 1, j = seasons.length - 1; i >= 0 && j >= 0; j--){
                            var pair = nameSimplifier.getSimplifiedSeasonName(shard, seasons[j].id)
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
                return group;
            })
            .addSubcommandGroup(group => {
                group.setName("ranked")
                group.setDescription(`Fetches ranked stats of a single ${shard} player for a particular season`)
                group.addSubcommand(subCommand => {
                    subCommand.setName("ez-fill")
                    subCommand.setDescription(`Fetches ranked stats of a single ${shard} player for a particular season`)
                    subCommand.addStringOption(option => {
                        option.setName("season")
                        option.setDescription("The stats for this season will be queried")
                        option.setRequired(true)
                        //TODO: proper season names.
                        for (var i = 0; i < size; i++) {
                            option.addChoice(`Season ${i}`, seasons[i].id)
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