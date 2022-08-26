const {SlashCommandBuilder} = require('@discordjs/builders');
const api = require('../../utility/api');
const commandsUpdater = require("../../commands-helper/guild-commands-updater");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("platform")
        .setDescription("Toggles commands for specific platforms")
        .addSubcommand(subCommand => {
            subCommand.setName("enable")
            subCommand.setDescription("Enables commands for the chosen platform")
            subCommand.addStringOption(option => {
                option
                    .setName("platform")
                    .setDescription("The platform to enable commands")
                    .setRequired(true)
                    .addChoice("Steam", "steam")
                    .addChoice("Playstation", "psn")
                    .addChoice("Xbox", "xbox")
                    .addChoice("Kakao", "kakao")
                    .addChoice("Stadia", "stadia")
                return option
            })

            return subCommand;
        })
        .addSubcommand(subCommand => {
            subCommand.setName("disable")
            subCommand.setDescription("Disables commands for the chosen platform")
            subCommand.addStringOption(option => {
                option
                    .setName("platform")
                    .setDescription("The platform to enable commands")
                    .setRequired(true)
                    .addChoice("Steam", "steam")
                    .addChoice("Playstation", "psn")
                    .addChoice("Xbox", "xbox")
                    .addChoice("Kakao", "kakao")
                    .addChoice("Stadia", "stadia")
                return option
            })
            return subCommand
        }),

    async execute(interaction) {
        await interaction.deferReply({ephemeral: false});
        let reply = "";

        const shard = interaction.options.getString("platform")
        const guildId = interaction.guildId;

        const value = interaction.options._subcommand === "enable";
        const guildCommand = {query: {}}
        guildCommand["_id"] = guildId;
        guildCommand.shard = shard;
        guildCommand.value = value
        guildCommand.query[shard] = value

        const payload = {
            applicationId: String(interaction.applicationId),
            guildId: String(interaction.guildId),
            channelId: String(interaction.channelId),
            userId: String(interaction.user.id),
            commandId: String(interaction.commandId),
            commandName: String(interaction.commandName),
            subCommandName: String(interaction.options._subcommand),
            options: interaction.options._hoistedOptions,
            date: interaction.createdAt,
        }

        guildCommand.interaction = payload

        const commandsUpdater = require('../../commands-helper/guild-commands-updater');

        const registeredInDiscord = await commandsUpdater.exists(guildId, shard)

        if (!registeredInDiscord && interaction.options._subcommand === "enable") {
            //proceeed to enable
            if (await commandsUpdater.put(interaction.guildId, shard)){
                const result = await api.fetchData("http://localhost:3000/discord/guildCommands", 10000, guildCommand, "PATCH")
                if (result.message === "Success") {
                    reply = `${shard} commands have been successfully ${interaction.options._subcommand}d.`
                }
                else {
                    reply = `There was an internal error enabling commands for ${shard}`
                }
            }
        }
        else if (registeredInDiscord && interaction.options._subcommand === "disable") {
            if (await commandsUpdater.delete(interaction.guildId, shard)) {
                const result = await api.fetchData("http://localhost:3000/discord/guildCommands", 7500, guildCommand, "PATCH")
                if (result.message === "Success") {
                    reply = `${shard} commands have been successfully ${interaction.options._subcommand}d.`
                }
                else {
                    reply = `There was an internal error enabling commands for ${shard}`
                }
            }
        }
        else {
            //no change needed.
            reply = `${shard} commands are already ${interaction.options._subcommand}d.`
        }

        await interaction.editReply(reply)
    }
}