const fetch = require('node-fetch');
const dotenv = require('dotenv');
const { MongoClient } = require('mongodb');
const AbortController = require("abort-controller")

dotenv.config();

const fetchData = async (url, timeout) => {

    const controller = new AbortController()
    const signal = controller.signal

    const timeout_ = setTimeout(() => {
        controller.abort();
    }, timeout);

    var getHeaders = function () {
        return {
            method: "GET",
            signal: signal,
            headers: {
                'Authorization': `Bearer ${process.env.PUBG_API_KEY}`,
                'Accept': 'application/vnd.routes+json',
            },
        }
    }

    const headers = getHeaders();
    return await fetch(url, headers)
        .then(res => {
            return res.json();
        }).then(body => {
            return body;
        }).catch(err => {
            console.log("error from routes: ", err.type);
            clearTimeout(timeout_);
            return err;
        });
}

const shards = {
    steam: "steam",
    psn: "psn",
    xbox: "xbox",
    kakao: "kakao",
    stadia: "stadia"
}

exports.handler = async (event) => {
    var url = `mongodb+srv://${process.env.MONGO_DB_USERNAME}:${process.env.MONGO_DB_PASSWORD}@clusterdev0.pcdo6.mongodb.net/test`;
    const client = new MongoClient(url);
    try {

        await client.connect();
        console.log("Connecting to mongoDB.");
        var database = client.db("PUBG");

        for (const [key, value] of Object.entries(shards)) {
            var seasons = database.collection(`Seasons-${value}`);

            console.log("Checking if there are any season documents in the season collection.");
            var seasonsCursor = await seasons.find({});

            var count = await seasonsCursor.count();
            console.log("Season count: ", count);
            if (count === 0) {
                console.log("Fetching seasons from pubg routes.");
                const results = await fetchData(`https://api.pubg.com/shards/${value}/seasons`, 5000);
                if (results instanceof Error) { console.log("error fetching seasons from pubg routes"); return; }
                if ('data' in results) {
                    var documents = [];
                    results.data.forEach(seasonObj => {
                        const document = {
                            type: seasonObj.type,
                            id: seasonObj.id,
                            isCurrentSeason: seasonObj.attributes.isCurrentSeason,
                            isOffseason: seasonObj.attributes.isOffseason
                        }
                        documents.push(document);
                    })

                    const result = await seasons.insertMany(documents);
                    console.log(`Inserted into Seasons-${value}. Status: `, result.acknowledged);
                }
            }
            else {
                console.log("Fetching seasons from pubg routes for comparison");
                const results = await fetchData(`https://api.pubg.com/shards/${value}/seasons`, 5000);
                if (results instanceof Error) { console.log("error fetching seasons from pubg routes"); return; }
                if ('data' in results) {
                    var seasonDocument = {
                        type: "", id: "", isCurrentSeason: false, isOffseason: false
                    }
                    results.data.forEach(seasonObj => {
                        if (seasonObj.attributes.isCurrentSeason === true) {
                            seasonDocument.type = seasonObj.type;
                            seasonDocument.id = seasonObj.id;
                            seasonDocument.isCurrentSeason = seasonObj.attributes.isCurrentSeason;
                            seasonDocument.isOffseason = seasonObj.attributes.isOffseason;
                        }
                    })

                    const document = await seasons.findOne({ isCurrentSeason: true })

                    if (document.id !== seasonDocument.id) {
                        console.log("Found a new season: ", seasonDocument.id);
                        const filter = { id: document.id }
                        const updateDoc = {
                            $set: {
                                isCurrentSeason: false
                            }
                        }
                        const options = { upsert: true }
                        const updateDocument = await seasons.updateOne(filter, updateDoc, options);
                        console.log("Is update document successful? ", updateDocument.acknowledged);

                        const insertResult = await seasons.insertOne(seasonDocument);
                        console.log("Is new live season mongoDB insertion successful? ", insertResult.acknowledged);
                    }
                    else { console.log(`No new seasons for ${value}.`); }
                }
            }
        }

    } catch (error) {
        console.log("ERROR: ", error);
    } finally {
        console.log("Closing mongodb connection");
        await client.close()
    }

    console.log("Quiting.");
}