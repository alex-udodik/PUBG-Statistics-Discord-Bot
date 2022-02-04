const fetch = require('node-fetch');
const dotenv = require('dotenv');
const { MongoClient } = require('mongodb');

dotenv.config();

const fetchData = async (url, timeout) => {

    const AbortController = globalThis.AbortController || await import('abort-controller')
    const controller = new AbortController();

    const timeout_ = setTimeout(() => {
        controller.abort();
    }, timeout);

    var getHeaders = function () {
        return {
            method: "GET",
            signal: controller.signal,
            headers: {
                'Authorization': `Bearer ${process.env.PUBG_API_KEY}`,
                'Accept': 'application/vnd.api+json',
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
            console.log("error from api: ", err.type);
            clearTimeout(timeout_);
            return err;
        });
}

(async () => {

    var url = `mongodb+srv://${process.env.MONGO_DB_USERNAME}:${process.env.MONGO_DB_PASSWORD}@clusterdev0.pcdo6.mongodb.net/test`;
    const client = new MongoClient(url);
    try {

        await client.connect();
        var database = client.db("PUBG");
        var seasons = database.collection("Seasons");
        var seasonsCursor = await seasons.find({});

        var count = await seasonsCursor.count();
        if (count === 0) {
            const results = await fetchData(`https://api.pubg.com/shards/steam/seasons`, 5000);
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
                console.log(documents);
                const result = await seasons.insertMany(documents);
                console.log("Inserted into Seasons. Status: ", result.acknowledged);
            }
        }
        else {
            console.log("seasons already in mongodb");
            const results = await fetchData(`https://api.pubg.com/shards/steam/seasons`, 5000);
            if ('data' in results) {
                var seasonDocument = {
                    type: "", id: "", isCurrentSeason: false, isOffseason: false
                }
                results.data.forEach(seasonObj => {
                    if (seasonObj.attributes.isCurrentSeason === true && seasonObj.id.includes("pc")) {
                        seasonDocument.type = seasonObj.type;
                        seasonDocument.id = seasonObj.id;
                        seasonDocument.isCurrentSeason = seasonObj.attributes.isCurrentSeason;
                        seasonDocument.isOffseason = seasonObj.attributes.isOffseason;
                    }
                })

                const document = await seasons.findOne({ isCurrentSeason: true })
                
                if (document.id !== seasonDocument.id) {
                    const filter = { id: document.id }
                    const updateDoc = {
                        $set: {
                            isCurrentSeason: false
                        }
                    }
                    const options = { upsert: true }
                    const updateDocument = await seasons.updateOne(filter, updateDoc, options);
                    console.log("Update document status: ", updateDocument.acknowledged);

                    const insertResult = await seasons.insertOne(seasonDocument);
                    console.log("New live season mongoDB insertion. Status: ", insertResult.acknowledged);
                }
                else { console.log("No new seasons."); }
            }
        }
    } catch (error) {
        console.log("ERROR: ", error);
    } finally {
        console.log("Closing mongodb connection");
        await client.close()
    }
})();
