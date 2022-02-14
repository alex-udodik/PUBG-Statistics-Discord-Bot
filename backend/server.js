const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const CacheSingleton = require('./utility/cache/redis-cache-singleton');
const MongodbSingleton = require('./utility/database/mongodb-singleton');
const AccountVerificationHandler = require('./api/account-authentication');
const stats = require('./api/fetch-stats');
const seasons = require('./api/seasons');
const validation = require('./api/get-request-url-validation');

const app = express();
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

    //TODO: factory for message
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
        res.send({statusCode: 502, message: error.message})
    }
});

app.get('/api/shard/:shard/seasons', async function (req, res) {

    const shard = req.params.shard;
    const results = await seasons.fetchSeasons(shard);

    res.send(JSON.stringify(results));
});

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

    } catch (error) {
        console.log("Error: ", error);
    }
})();