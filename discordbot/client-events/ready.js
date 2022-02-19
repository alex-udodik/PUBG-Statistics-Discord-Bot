const {REST} = require("@discordjs/rest");
const {Routes} = require("discord-api-types/v9");
const backendListener = require("../utility/backend-notifications/backend-listener-singleton");
const fs = require("fs");
const {Collection} = require("discord.js");
const api = require('../utility/api')
const slashCommand = require('../commands-helper/command-builder')

module.exports = {

    async execute(client) {

        const globalCommands = await readGlobalCommands(client);
        const guilds = await readGuildCommands(client);

        const clientId = process.env.CLIENT_ID;

        console.log("Bot is online.");

        const rest = new REST({version: '9'}).setToken(process.env.BOT_TOKEN);

        try {
            console.log('Started refreshing application (/) commands.');

            await rest.put(
                Routes.applicationCommands(clientId),
                {body: globalCommands}
            );

            await Promise.all(guilds.map(async guild => {
                await rest.put(Routes.applicationGuildCommands(clientId, guild.id),
                    {body: guild.commands})
            }))

            console.log('Successfully reloaded application (/) commands.');
        } catch (error) {
            console.error(error);
        }
    }
}


const readGlobalCommands = async (client) => {
    const globalCommands = [];
    const commandFiles = fs.readdirSync('./commands/global-commands/').filter(file => file.endsWith('.js'));
    client.commands = new Collection();

    for (const file of commandFiles) {
        const command = require(`../commands/global-commands/${file}`);
        globalCommands.push(command.data.toJSON());
        client.commands.set(command.data.name, command);
    }
    return globalCommands;
}

const readGuildCommands = async (client) => {
    const guilds = [];
    const commandFiles = fs.readdirSync('./commands/guild-commands/').filter(file => file.endsWith('.js'));

    const documents = await api.fetchData("http://localhost:3000/discord/guildCommands/all", 60000, null, "GET");
    await Promise.all(documents.message.map(async document => {
        var guildCommands = []
        for (const [shard, value] of Object.entries(document)) {
            if (value === true) {
                const module = require(`../commands/guild-commands/${shard}.js`)
                module.data = await slashCommand.getParticularSlashCommand(shard)
                const command = module.data.toJSON()
                guildCommands.push(command)
            }
        }
        var guild = {id: document._id, commands: guildCommands}
        guilds.push(guild)
    }))

    for (const file of commandFiles) {
        const command = require(`../commands/guild-commands/${file}`);
        client.commands.set(command.data.name, command);
    }

    return guilds;
}
