const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const CacheSingleton = require('./utility/cache/redis-cache-singleton');
const MongodbSingleton = require('./utility/database/mongodb-singleton');
const AccountVerificationHandler = require('./api/account-authentication');
const vl = require('./api/req-body-validator');
const stats = require('./api/fetch-stats');

const app = express();
const port = 3000;

dotenv.config();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function(req, res) {
    res.send({message: "Hello World!"})
});

app.post('/api/unranked/stats', async function(req, res) {
    console.log("Receiving names: ", req.body.names);

    console.log("Validation results: ", vl.validateJSON(req.body));
    const parsingErrorObj = vl.validateJSON(req.body);
    if (parsingErrorObj !== true) {res.send(parsingErrorObj)}
    else {
        var accounts = req.body.names;
        var accountVerification = new AccountVerificationHandler(accounts);
        const obj = await accountVerification.verifyAccounts();
        const fetchedStats = await stats.fetchStats(obj, "lifetime", "squad-fpp", false);
        
        if (fetchedStats instanceof Error) { res.send({statusCode: 502, message: "Failed to fetch stats from Pubg api"})}
        else {
            const response = {validAccounts: obj.validAccounts, invalidAccounts: obj.invalidAccounts}
            res.send(response);
        }
    }
});

app.post('/api/ranked/stats', function(req, res) {
    res.send("ranked stats!");
});

app.listen(port, function() {
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