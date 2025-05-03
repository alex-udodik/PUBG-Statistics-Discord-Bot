const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = function getRevivesCommand(shard) {
    return new SlashCommandBuilder()
        .setName("unranked-graph-revives")
        .setDescription(`Graph revives-per-minute for ${shard} players across all seasons`)
        .addStringOption(option =>
            option.setName("game-mode")
                .setDescription("Choose a game-mode")
                .setRequired(true)
                .addChoices(
                    { name: "FPP Squad", value: "squad-fpp" },
                    { name: "FPP Duo", value: "duo-fpp" },
                    { name: "FPP Solo", value: "solo-fpp" },
                    { name: "TPP Squad", value: "squad" },
                    { name: "TPP Duo", value: "duo" },
                    { name: "TPP Solo", value: "solo" }
                )
        )
        .addStringOption(option =>
            option.setName("names")
                .setDescription("PUBG name (Max 1)")
                .setRequired(true)
        );
};
