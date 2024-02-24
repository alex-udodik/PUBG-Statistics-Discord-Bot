
module.exports = {

    watch(database, callback) {

        const collection = database.collection("Seasons-xbox");
        let watcher = collection.watch()
            .on("change", next => {
                console.log("received a change to the collection: \t", next.operationType, next.ns.db, next.ns.coll);
                callback("xbox")
            })
            .on("error", e => {
                console.error("Watcher died");

                watcher.cursor.close();

                watch(database, callback);
            });
    }
}