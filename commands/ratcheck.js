const { SlashCommandBuilder } = require('@discordjs/builders');
const api = require('../utility/pubg/api');
const mongodb = require('../utility/database/mongodb-helper');
const cache = require('../utility/cache/cache');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('ratcheck')
        .setDescription('Check if a PUBG player is a rat.')
        .addStringOption(option =>
            option
                .setName('pubg-ign')
                .setDescription('Case-sensitive for 1st-time names! Example: DallasCowboy')
                .setRequired(true)
        ),

    async execute(interaction) {

        const ttl = 10;

        await interaction.deferReply({ ephemeral: true });

        const pubg_name = interaction.options.getString('pubg-ign');

        console.log(`Checking cache for: ${pubg_name.toLowerCase()}`);

        const accountId = await cache.verifyKey(pubg_name.toLowerCase())
        if (accountId !== null) {

            //name is in cache
            console.log(`Cache look-up successful. ${pubg_name}'s id is: ${accountId}`);

            //proceed to build a player stats query for PUBG API
            await interaction.editReply(`Found ${pubg_name} from cache`);
            return;
        }
        else {

            console.log(`${pubg_name} not in cache. Need to check name from mongodb`);

            const query = {
                name: pubg_name.toLowerCase(),
            }

            const document = await mongodb.findOne("PUBG", "Names", query);

            if (document !== null) {
                //name exists in mongodb
                //grab the id and name and put into cache
                //construct query for PUBG API
                console.log(`Returned document from mongodb: `, document);
                const name = document.name;
                const accountId = document.accountId;

                console.log(`Inserting ${name} : ${accountId} to cache with ${ttl} seconds for TTL`);
                cache.insertKey(name, accountId, ttl);

                await interaction.editReply(`Found ${name} from mongodb`);
                return;
            }
            else {

                //name does not exist in cache or mongodb. 
                //Fetch player name from PUBG API and save to mongodb + cache

                console.log(`${pubg_name} not in mongodb. Need to fetch name from PUBG API`);
                const url = `https://api.pubg.com/shards/steam/players?filter[playerNames]=${pubg_name}`
                const data = await api.fetchData(url);
                console.log(`Fetched ${pubg_name}'s account information: `, data);

                if ('data' in data) {
                    //create a mongodb document and insert into mongodb

                    const document = {
                        name: pubg_name.toLowerCase(),
                        displayName: pubg_name,
                        accountId: data.data[0].id
                    }

                    const acknowledged = await mongodb.insertOne("PUBG", "Names", document);
                    console.log(`Inserting ${document.displayName} to mongodb. Acknowledged: ${acknowledged}`);


                    console.log(`Inserting ${pubg_name.toLowerCase()} : ${data.data[0].id} to cache with ${ttl} seconds for TTL`);
                    cache.insertKey(document.name, document.accountId, ttl);

                    await interaction.editReply(`Found ${pubg_name} from PUBG API`);
                    return;
                }
                else {
                    console.log(`${pubg_name} does not exist in the PUBG API`);
                    await interaction.editReply(
                        `${pubg_name} does not exist in the PUBG API. Names are case-sensitive and must be spelled correctly.`
                    )
                    return;
                }
            }
        }
    }
}