
module.exports = {

    watch(database, callback) {

        const collection = database.collection("Seasons-kakao");
        let changeStream = collection.watch();

        changeStream.on("change", next => {
            console.log("received a change to the collection: \t", next.operationType, next.ns.db, next.ns.coll);
            callback("kakao")
        });
    }
}