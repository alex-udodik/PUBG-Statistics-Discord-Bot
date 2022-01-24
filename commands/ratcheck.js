const { SlashCommandBuilder } = require('@discordjs/builders');
const PubgAPI = require('../utility/pubg-api-helper/fetch');
const Botcache = require('../utility/cache');
const mongodb = require('../utility/database/mongodb-helper');
const { insertCache } = require('../utility/cache');
const { insertOne } = require('../utility/database/mongodb-helper');


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

        await interaction.deferReply({ ephemeral: true });

        const pubg_name = interaction.options.getString('pubg-ign');
        //const url = `https://api.pubg.com/shards/steam/players?filter[playerNames]=$${pubg_name}`
        //const data = await PubgAPI.fetchData(url);
        //console.log("Data: ", data);

        
        
        const resultGet = await Botcache.verifyCache(pubg_name)
        if (resultGet !== null) {
            console.log("Cache results after get: ", resultGet);
        }
        else {
            console.log("Key missing. Need to fetch from database");

            /*
            const query = {
                name: pubg_name,
            }
            const insertOneResults = await mongodb.findOne("PUBG", "Names", query);
            console.log("results: ", insertOneResults);
            */

            const document = {
                name: pubg_name.toLowerCase(),
                display_name: pubg_name,
                accountId: "account.23089ru20934u2093"
            }

            const insertOne = await mongodb.insertOne("PUBG", "Names", document);
            console.log("insertOne results: ", insertOne);
            
            const resultSet = await Botcache.insertCache(pubg_name, "123123", 10);
        }
       
        
        await interaction.editReply('Results');    
    }
}