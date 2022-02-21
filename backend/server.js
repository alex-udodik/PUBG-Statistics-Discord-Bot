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
expressWs = expressWs(express());

const app = expressWs.app;
const port = 3000;

dotenv.config();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('/', function (req, res) {
    res.send({message: "Hello World!"})
});

app.get('/api/seasonStats/shard/:shard/seasons/:season/gameMode/:gameMode/ranked/:ranked/players', async function (req, res) {
    const shard = req.params.shard.toLowerCase();
    const season = req.params.season.toLowerCase();
    const gameMode = req.params.gameMode.toLowerCase();
    var ranked = req.params.ranked.toLowerCase();
    const players = req.query.array.split(",");

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

        const fetchedStats = await stats.fetchStats(obj, shard, season, gameMode, ranked);
        const response = {
            statusCode: 200,
            validAccounts: fetchedStats.validAccounts,
            invalidAccounts: fetchedStats.invalidAccounts
        }
        res.send(response);

    } catch (error) {
        if (error.message === 429) {res.send({statusCode: 429, message: "Too many requests to the PUBG API. Please wait."})}
        else {res.send({statusCode: 502, message: error.message})}
    }
});

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