const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { Client, Intents, Collection } = require('discord.js');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

const guildId = process.env.GUILD_ID;
const clientId = process.env.CLIENT_ID;

const client = new Client({
    intents: [Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES]
});

client.commands = new Collection();

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.push(command.data.toJSON());
    client.commands.set(command.data.name, command);
}

client.on("ready", () => {
    console.log("Bot is online.");

    const rest = new REST({ version: '9' }).setToken(process.env.BOT_TOKEN);
    (async () => {
        try {
            console.log('Started refreshing application (/) commands.');

            await rest.put(
                Routes.applicationGuildCommands(clientId, guildId),
                { body: commands }
            );

            console.log('Successfully reloaded application (/) commands.');
        } catch (error) {
            console.error(error);
        }
    })();
});

client.on("interactionCreate", async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;
    console.log(command);

    try {
        await command.execute(interaction);
    } catch (err) {
        if (err) console.error(err);

        await interaction.editReply({
            content: "An error occured while executing the command.",
            ephemeral: true
        });
    }
});

client.login(process.env.BOT_TOKEN);