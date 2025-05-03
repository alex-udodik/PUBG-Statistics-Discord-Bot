const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = function getRankedCommand(shard) {
    return new SlashCommandBuilder()
        .setName("ranked-one-season")
        .setDescription(`Fetch ranked stats of a ${shard} player for a specific season`)
        .addStringOption(option =>
            option.setName("season")
                .setDescription("The stats for this season will be queried")
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName("game-mode")
                .setDescription("Choose a game-mode")
                .setRequired(true)
                .addChoices(
                    { name: "FPP Squad", value: "squad-fpp" },
                    { name: "FPP Solo", value: "solo-fpp" },
                    { name: "TPP Squad", value: "squad" },
                    { name: "TPP Solo", value: "solo" }
                )
        )
        .addStringOption(option =>
            option.setName("names")
                .setDescription("PUBG name (Max 1)")
                .setRequired(true)
        );
};
