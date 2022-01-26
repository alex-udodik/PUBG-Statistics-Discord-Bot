const { SlashCommandBuilder } = require('@discordjs/builders');
const api = require('../utility/pubg/api');
const mongodb = require('../utility/database/mongodb-helper');
const cache = require('../utility/cache/cache');
const stats = require('../utility/pubg/stats');
const parse = require('../utility/parse');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('ratcheck-lifetime')
        .setDescription('Shows the rat rating for lifetime stats of a pubg player')
        .addStringOption(option =>
            option
                .setName('names')
                .setDescription('Case-sensitive for 1st-time names! Example: DallasCowboy TGLTN')
                .setRequired(true)
        ),

    async execute(interaction) {

        
        //https://api.pubg.com/shards/steam/seasons/lifetime/gameMode/squad-fpp/players?filter[playerIds]=account.11395d32968f4e43842c7e1317afd1b9,account.b92bd758b729428f8e5f4faeeeee0348
        await interaction.deferReply({ ephemeral: true });

        const pubg_name = interaction.options.getString('names');
        const names = pubg_name.split(/[ ,]+/)
        console.log("Names: ", names);
        console.log(`Checking cache for: ${pubg_name.toLowerCase()}`);

        const accountId = await cache.verifyKey(pubg_name.toLowerCase())
        if (accountId !== null) {

            //name is in cache
            console.log(`Cache look-up successful. ${pubg_name}'s id is: ${accountId}`);

            console.log(`Fetching stats for: ${pubg_name}`);
            //create query to pubg api
            const pubg_data = await api.fetchData(`https://api.pubg.com/shards/steam/players/${accountId}/seasons/lifetime`);
            const rat_ing = stats.getRatRating(pubg_data);
            var status = String(pubg_data);
            if (status.indexOf("connect ETIMEDOUT") >= 0) {
                console.log("Connection time out to PUBG API");
                await interaction.editReply(
                    `PUBG API connectioned timed out`
                )
                return;
            }

            await interaction.editReply(`Rat-rating for ${pubg_name}: ${rat_ing}`);
            return;

        } else {

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

                console.log(`Inserting ${name} : ${accountId} to cache with ${cache.TTL} seconds for TTL`);
                cache.insertKey(name, accountId, cache.TTL);

                console.log(`Fetching stats for: ${pubg_name}`);
                //create query to pubg api
                const pubg_data = await api.fetchData(`https://api.pubg.com/shards/steam/players/${accountId}/seasons/lifetime`);
                const rat_ing = stats.getRatRating(pubg_data);
                var status = String(pubg_data);
                if (status.indexOf("connect ETIMEDOUT") >= 0) {
                    console.log("Connection time out to PUBG API");
                    await interaction.editReply(
                        `PUBG API connectioned timed out`
                    )
                    return;
                }

                await interaction.editReply(`Rat-rating for ${pubg_name}: ${rat_ing}`);
                return;
            }
            else {

                //name does not exist in cache or mongodb. 
                //Fetch player name from PUBG API and save to mongodb + cache

                console.log(`${pubg_name} not in mongodb. Need to fetch name from PUBG API`);
                const url = `https://api.pubg.com/shards/steam/players?filter[playerNames]=${pubg_name}`
                const pubgdata = await api.fetchData(url);
                console.log(`Fetched ${pubg_name}'s account information: `, pubgdata);

                var status = String(pubgdata);
                if (status.indexOf("connect ETIMEDOUT") >= 0) {
                    console.log("Connection time out to PUBG API");
                    await interaction.editReply(
                        `PUBG API connectioned timed out`
                    )
                    return;
                }
                if ('data' in pubgdata) {
                    //create a mongodb document and insert into mongodb

                    const document = {
                        name: pubg_name.toLowerCase(),
                        displayName: pubg_name,
                        accountId: pubgdata.data[0].id
                    }

                    const acknowledged = await mongodb.insertOne("PUBG", "Names", document);
                    console.log(`Inserting ${document.displayName} to mongodb. Acknowledged: ${acknowledged}`);


                    console.log(`Inserting ${pubg_name.toLowerCase()} : ${pubgdata.data[0].id} to cache with ${cache.TTL} seconds for TTL`);
                    cache.insertKey(document.name, document.accountId, cache.TTL);

                    const url = `https://api.pubg.com/shards/steam/players/${document.accountId}/seasons/lifetime`;
                    const statsData = await api.fetchData(url);
                    const rat_ing = stats.getRatRating(statsData);
                    await interaction.editReply(`Rat-rating for ${pubg_name}: ${rat_ing}`);

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