const mytime = require('./utility/time');
const api = require('../backend/utility/pubg/api');
async function main() {
   console.log(mytime.getTimestamp() + " Started match farmer");

   const endpoint = "https://api.pubg.com/shards/steam/samples?filter[createdAt-start]=2023-04-20T00%3A00%3A00Z";
   const data = await api.fetchData(endpoint, 10000)

   console.log(data);
}

async function run() {
   await main();
   setInterval(main, 200000)
}


run();