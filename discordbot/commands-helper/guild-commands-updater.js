const slashCommand = require("./command-builder");
const {Routes} = require("discord-api-types/v9");
const {REST} = require("@discordjs/rest");
const fs = require("fs");
const api = require("../utility/api");

module.exports = {

    async delete(guildId, shard) {
        try {
            const rest = new REST({version: '9'}).setToken(process.env.BOT_TOKEN);

            const commands = await rest.get(Routes.applicationGuildCommands(process.env.CLIENT_ID, guildId));
            for (command of commands) {
                if (command.name === `stats-${shard}`) {
                    const commandId = command.id
                    const deleteUrl = `${Routes.applicationGuildCommands(process.env.CLIENT_ID, guildId)}/${commandId}`
                    await rest.delete(deleteUrl)
                    break;
                }
            }
            return true;
        } catch (error) {
            return false
        }
    },

    async put(guildId, shard) {

        try {
            const document = await api.fetchData(`http://localhost:3000/discord/guildCommands/guild/${guildId}`, 5000, null, "GET");
            var guildCommands = []
            for (const [shard_, value] of Object.entries(document)) {
                if (value === true || shard === shard_) {
                    const module = require(`../commands/guild-commands/${shard_}.js`)
                    module.data = await slashCommand.getParticularSlashCommand(shard_)
                    const command = module.data.toJSON()
                    guildCommands.push(command)
                }
            }

            const rest = new REST({version: '9'}).setToken(process.env.BOT_TOKEN);
            await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, guildId),
                {body: guildCommands})
            return true;

        } catch (error) {
            return false;
        }
    },
}