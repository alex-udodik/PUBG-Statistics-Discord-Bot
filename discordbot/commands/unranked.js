const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = function getUnrankedCommand(shard) {
    return new SlashCommandBuilder()
        .setName("unranked-one-season")
        .setDescription(`Fetch unranked stats of ${shard} players for a specific season`)
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
                    { name: "FPP Duo", value: "duo-fpp" },
                    { name: "FPP Solo", value: "solo-fpp" },
                    { name: "TPP Squad", value: "squad" },
                    { name: "TPP Duo", value: "duo" },
                    { name: "TPP Solo", value: "solo" }
                )
        )
        .addStringOption(option =>
            option.setName("names")
                .setDescription("Case-sensitive PUBG names (Max 10)")
                .setRequired(true)
        );
};
