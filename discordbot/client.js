const { Client, Intents, Collection } = require('discord.js');
const fs = require('fs');
const dotenv = require('dotenv');
const backendListener = require("./utility/backend-notifications/backend-listener-singleton");

dotenv.config();

const client = new Client({
    intents: [Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES]
});

client.commands = new Collection();

client.on("ready", async () => {
    await require('./client-events/ready').execute(client);
});

client.on( "guildCreate", async guild => {
    await require('./client-events/guildCreate').execute(guild)
})

client.on( "guildDelete", async guild => {
    await require('./client-events/guildDelete').execute(guild)
})

client.on("interactionCreate", async interaction => {
    await require('./client-events/interactionCreate').execute(interaction, client);
});

backendListener.getInstance().onmessage = async event => {
    const response = JSON.parse(event.data)
    console.log("Message from server: ", response)

    const shard = response.shard;
    const updater = require('./commands-helper/guild-commands-updater')
    await Promise.all(response.guildCommands.map(async guildCommand => {
            if (guildCommand[shard] === true) {
                await updater.put(guildCommand._id, shard)
            }
        }
    ))
}

client.login(process.env.BOT_TOKEN);