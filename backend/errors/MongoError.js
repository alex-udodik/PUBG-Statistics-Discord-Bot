class MongoError extends Error {
    constructor(args) {
        super(args);
        this.name = "MongoError";
        this.message = args;
    }
}

module.exports = MongoError;