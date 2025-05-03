const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const dotenv = require('dotenv');
const backendListener = require("./utility/backend-notifications/backend-listener-singleton");

dotenv.config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages
    ]
});

client.commands = new Collection();

client.on("ready", async () => {
    await require('./client-events/ready').execute(client);
});

client.on("guildCreate", async guild => {
    await require('./client-events/guildCreate').execute(guild);
});

client.on("guildDelete", async guild => {
    await require('./client-events/guildDelete').execute(guild);
});

client.on("interactionCreate", async interaction => {
    await require('./client-events/interactionCreate').execute(interaction, client);
});

backendListener.getInstance().onmessage = async event => {


};

client.login(process.env.BOT_TOKEN);
