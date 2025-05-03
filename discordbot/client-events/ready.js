const { REST } = require('@discordjs/rest');
const { Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        console.log("🟢 Bot is online.");

        const commands = [];
        const commandsPath = path.join(__dirname, '..', 'commands');
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            const command = require(path.join(commandsPath, file));

            if ('data' in command && 'execute' in command) {
                commands.push(command.data.toJSON());
                client.commands.set(command.data.name, command);
            } else {
                console.warn(`[WARN] Command in '${file}' is missing 'data' or 'execute'`);
            }
        }


        const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);
        const clientId = process.env.CLIENT_ID;

        try {
            console.log('🔄 Refreshing global slash commands...');

            await rest.put(
                Routes.applicationCommands(clientId),
                { body: commands }
            );

            console.log('✅ Successfully registered global commands.');
        } catch (error) {
            console.error('❌ Failed to register commands:', error);
        }
    }
};
