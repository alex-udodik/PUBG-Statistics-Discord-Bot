const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const CacheSingleton = require('./utility/cache/redis-cache-singleton');
const MongodbSingleton = require('./utility/database/mongodb-singleton');
const AccountVerificationHandler = require('./routes/account-authentication');
const stats = require('./routes/fetch-stats');
const seasons = require('./routes/seasons');
const validation = require('./routes/get-request-url-validation');
const guildCommandController = require('./routes/discord/guild-command-controller')
const mongo = require('./utility/database/mongodb-helper')

const WebSocket = require('ws');
var expressWs = require('express-ws');
const BotAnalytics = require("./analytics/analytics");
expressWs = expressWs(express());

const app = expressWs.app;
const port = 2999;

dotenv.config();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('/', function (req, res) {
    res.send({message: "Hello World!"})
});

app.post('/api/seasonStats/shard/:shard/seasons/:season/gameMode/:gameMode/ranked/:ranked/players', async function (req, res) {
    const shard = req.params.shard.toLowerCase();
    const season = req.params.season.toLowerCase();
    const gameMode = req.params.gameMode.toLowerCase();
    var ranked = req.params.ranked.toLowerCase();
    const players = req.query.array.split(",");

    const interaction = req.body;
    const BotAnalytics = require('./analytics/analytics')
    try {
        if (!validation.isShardValid(shard)) {
            res.send({statusCode: 400, message: "Invalid shard"})
            return;
        }
        if (!await validation.isSeasonValid(season, shard)) {
            res.send({statusCode: 400, message: "Invalid season or season does not exist with provided shard"})
            return;
        }
        if (!validation.isGameModeValid(gameMode)) {
            res.send({statusCode: 400, message: "Invalid gameMode"})
            return;
        }
        if (!validation.isRankedValid(ranked)) {
            res.send({statusCode: 400, message: "Ranked parameter must contain true or false"})
            return;
        }
        ranked = (ranked === 'true')

        if (!validation.isPlayerCountValid(ranked, players)) {
            res.send({statusCode: 400, message: ranked ? "Ranked requires no more than 1 player" : "Unranked requires no more than 10 players"})
            return;
        }
        //TODO: cache seasons.

        var accountVerification = new AccountVerificationHandler(players, shard);
        var obj = await accountVerification.verifyAccounts();

        const fetchedStats = await stats.fetchStats(obj, shard, season, gameMode, ranked, false);
        const response = {
            statusCode: 200,
            validAccounts: fetchedStats.validAccounts,
            invalidAccounts: fetchedStats.invalidAccounts
        }
        const analytics = new BotAnalytics(interaction, false)
        await analytics.send("DiscordBot-PubgStats", "Analytics")
        res.send(response);

    } catch (error) {
        if (error.message === 429) {
            const analytics = new BotAnalytics(interaction, true)
            analytics.send("DiscordBot-PubgStats", "Analytics")
            res.send({statusCode: 429, message: "Too many requests to the PUBG API. Please wait."})
        }
        else {res.send({statusCode: 502, message: error.message})}
    }
});

app.post('/api/graph/:statType/shard/:shard/gameMode/:gameMode/ranked/:ranked/players', async function(req, res) {
    const shard = req.params.shard.toLowerCase();
    const gameMode = req.params.gameMode.toLowerCase();
    var ranked = req.params.ranked.toLowerCase();
    const statType = req.params.statType.toLowerCase();
    const players = req.query.array.split(",");

    const interaction = req.body;
    const BotAnalytics = require('./analytics/analytics')
    try {
        if (!validation.isShardValid(shard)) {
            res.send({statusCode: 400, message: "Invalid shard"})
            return;
        }
        if (!validation.isGameModeValid(gameMode)) {
            res.send({statusCode: 400, message: "Invalid gameMode"})
            return;
        }
        if (!validation.isRankedValid(ranked)) {
            res.send({statusCode: 400, message: "Ranked parameter must contain true or false"})
            return;
        }
        ranked = (ranked === 'true')

        if (!validation.isPlayerCountValid(ranked, players)) {
            res.send({statusCode: 400, message: ranked ? "Ranked requires no more than 1 player" : "Unranked requires no more than 10 players"})
            return;
        }
        //TODO: cache seasons.

        var accountVerification = new AccountVerificationHandler(players, shard);
        var obj = await accountVerification.verifyAccounts();

        var response = {
            statusCode: 200,
            validAccounts: obj.validAccounts,
            invalidAccounts: obj.invalidAccounts,
            url: ""
        }
        if (obj.validAccounts.length === 0) {
            res.send(response)
            return;
        }

        //get seasons
        const seasonList = await seasons.fetchSeasons(shard);

        var buildObject = {
            displayName: obj.validAccounts[0].displayName,
            seasonsWithStats: [],
        }

        //send in each season and create response
        for (const season of seasonList){
            const fetchedStats = await stats.fetchStats(obj, shard, season.id, gameMode, ranked, true);
            const object = {
                season: season,
                stats: fetchedStats.validAccounts[0].rawStats
            }

            buildObject.seasonsWithStats.push(object)
        }
        const enums = require('../discordbot/utility/global-enums')
        const mode = enums[gameMode.replace("-", "")]
        buildObject.gameMode_ = mode

        const chart = require('./utility/quick-charts/chart-factory')
        const url = await chart.getChart(statType, buildObject)
        response.url = url
        response.displayName = obj.validAccounts[0].displayName
        response.embedColor = statType === "fragger" ? "#DC9A01" : "#889E55"
        response.description = statType === "fragger" ? `Unranked\n${mode}\nFragger Rating` : `Unranked\n${mode}\nRevives Per Min`

        const analytics = new BotAnalytics(interaction, false)
        analytics.send("DiscordBot-PubgStats", "Analytics")

        res.send(response);

    } catch (error) {
        if (error.message === 429) {
            const analytics = new BotAnalytics(interaction, true)
            analytics.send("DiscordBot-PubgStats", "Analytics")
            res.send({statusCode: 429, message: "Too many requests to the PUBG API. Please wait."})
        }
        else {res.send({statusCode: 502, message: error.message})}
    }
})

app.get('/api/shard/:shard/seasons', async function (req, res) {

    const shard = req.params.shard;
    const results = await seasons.fetchSeasons(shard);

    res.send(JSON.stringify(results));
});

app.get('/api/test', async function (req, res) {
    res.send(JSON.stringify("test"));
    notify("test data")
});

app.post('/discord/guildCommands', async function (req, res) {
    const document = req.body;
    const result = await guildCommandController.post(document);
    const message = result ? "Success" : "Fail";
    res.send({ message: message})
})

app.delete('/discord/guildCommands', async function (req, res) {
    const guildId = req.body._id.toLowerCase();
    const result = await guildCommandController.delete(guildId)
    res.send({message: result ? "Success" : "Fail"})
})

app.patch('/discord/guildCommands', async function (req, res) {
    const document = req.body;

    var query = {};
    query._id = document._id;
    query[document.shard] = document.value

    const analytics = new BotAnalytics(document.interaction, false)
    analytics.send("DiscordBot-PubgStats", "Analytics")

    const alreadyExists = await mongo.findOne("DiscordBot-PubgStats", "GuildCommands", query)
    if (alreadyExists !== null) {res.send({message: "Exists"})}
    else {
        const result = await guildCommandController.patch(document)
        res.send({message: result ? "Success" : "Fail"})
    }

})

app.get('/discord/guildCommands/guild/:guildId', async function (req, res) {
    const guildId = req.params.guildId.toLowerCase();
    const item = await mongo.findOne("DiscordBot-PubgStats", "GuildCommands", {_id: guildId})
    res.send(item)
})

app.get('/discord/guildCommands/all', async function(req, res) {
    const cursor = await mongo.findAll("DiscordBot-PubgStats", "GuildCommands")
    var documents = []
    await cursor.forEach(document => {
        documents.push(document)
    })
    res.send({message: documents})
})


// websocket route
app.ws('/notifications', (ws, req) => {
    ws.on('close', () => {
        console.log(`WebSocket was closed.`)
    })
})

// Let all dashboard clients know.
function notify(data) {
    expressWs.getWss('/notifications').clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}

async function generateLatestSeason(shard) {
    const cursor = await mongo.findAll("DiscordBot-PubgStats", "GuildCommands")
    var documents = []
    await cursor.forEach(document => { documents.push(document) })
    var response = { shard: shard, guildCommands: documents}

    notify(response)
}

app.listen(port, function () {
    console.log(`Listening on port ${port}!`)
});


(async () => {

    var cache = CacheSingleton.getInstance();
    cache.on('error', (err) => console.log('Redis Client Error', err));
    try {
        await cache.connect();
        var mongodb = MongodbSingleton.getInstance();
        await mongodb.connect();

        //listen to mongodb seasons for changes
        mongo.watch("PUBG", generateLatestSeason)

    } catch (error) {
        console.log("Error: ", error);
    }
})();