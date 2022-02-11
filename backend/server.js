const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const CacheSingleton = require('./utility/cache/redis-cache-singleton');
const MongodbSingleton = require('./utility/database/mongodb-singleton');
const AccountVerificationHandler = require('./api/account-authentication');
const stats = require('./api/fetch-stats');
const seasons = require('./api/seasons');

const app = express();
const port = 3000;

dotenv.config();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('/', function (req, res) {
    res.send({message: "Hello World!"})
});

app.get('/api/shards/:shard/players/:player/seasons/:season/ranked', async function (req, res) {
    const shard = req.params.shard;
    const season = req.params.season;
    const player = req.params.player

    var accountVerification = new AccountVerificationHandler([player]);
    const obj = await accountVerification.verifyAccounts();
    const fetchedStats = await stats.fetchStats(obj, shard, season, null, true);
    if (fetchedStats instanceof Error) {
        res.send({statusCode: 502, message: "Failed to fetch stats from Pubg api"})
    } else {
        const response = {validAccounts: obj.validAccounts, invalidAccounts: obj.invalidAccounts}
        res.send(response);
    }

    console.log("Query: ", shard, season, player);
});

app.get('/api/shard/:shard/seasons/:season/gameMode/:gameMode/players', async function (req, res) {
    const shard = req.params.shard;
    const season = req.params.season;
    const gameMode = req.params.gameMode;
    const players = req.query.array.split(",");

    console.log("Received player names: ", players);
    var accountVerification = new AccountVerificationHandler(players, shard, season, gameMode);
    const obj = await accountVerification.verifyAccounts();

    //verify season. It could be in cache.
    const fetchedStats = await stats.fetchStats(obj, shard, season, gameMode, false);

    if (fetchedStats instanceof Error) {
        res.send({statusCode: 502, message: "Failed to fetch stats from Pubg api"})
    } else {
        const response = {validAccounts: obj.validAccounts, invalidAccounts: obj.invalidAccounts}
        res.send(response);
    }
    console.log("Query: ", shard, season, gameMode, players);
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