const BotAnalytics = require("../analytics/analytics");

module.exports = {
    async execute(interaction, client) {
        if (!interaction.isCommand()) return;

        const command = client.commands.get(interaction.commandName);

        if (!command) return;
        console.log(command);

        try {
            const isRateLimited = await command.execute(interaction);
            const commandAnalytics = new BotAnalytics(interaction, isRateLimited)
            await commandAnalytics.send("DiscordBot-PubgStats", "Analytics")
        } catch (err) {
            if (err) console.error(err);

            await interaction.editReply({
                content: "An error occured while executing the command.",
                ephemeral: true
            });
        }
    }
}