const { Client, Intents, Collection } = require('discord.js');
const fs = require('fs');
const dotenv = require('dotenv');
const MongodbSingleton = require('../backend/utility/database/mongodb-singleton');
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

backendListener.getInstance().onmessage = event => {
    console.log("Message from server: ", event.data)

}

client.login(process.env.BOT_TOKEN);

(async () => {
    try {

        var mongodb = MongodbSingleton.getInstance();
        await mongodb.connect();
    } catch (error) {
        console.log("Error: ", error);
    }
})();